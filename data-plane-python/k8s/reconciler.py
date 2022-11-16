#! /usr/bin/env python3
from pathlib import Path
import asyncio
import json
import os
import sys

from attrs import define
from dotenv import load_dotenv
from emoji import emojize
import kubernetes

from nile_api import AuthenticatedClient, Client, events
from nile_api.models.create_entity_request import CreateEntityRequest
from nile_api.models.login_info import LoginInfo
from nile_api.api.developers import login_developer
from nile_api.api.entities import list_instances_in_workspace

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
EAR = emojize(":ear:")
NEW = emojize(":new:", language="alias")
THUMBSUP = emojize(":thumbs_up:")
WASTEBASKET = emojize(":wastebasket:")

load_dotenv(override=True)
params = {
    param: os.environ.get(param)
    for param in [
        "NILE_URL",
        "NILE_WORKSPACE",
        "NILE_DEVELOPER_EMAIL",
        "NILE_DEVELOPER_PASSWORD",
        "NILE_ORGANIZATION_NAME",
        "NILE_ENTITY_NAME",
    ]
}

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values"  # noqa: E501
        )
        sys.exit(1)

flink_path = Path(__file__).absolute().parent / "spec/FlinkDeployment.json"
try:
    contents = flink_path.read_text()
except FileNotFoundError:
    print(f"{BAD} could not find {flink_path}")
    sys.exit(1)
else:
    entity_definition = CreateEntityRequest.from_dict(json.loads(contents))


async def run():
    token = await login_developer.asyncio(
        client=Client(base_url=params["NILE_URL"]),
        json_body=LoginInfo(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        ),
    )

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

    print(
        f"{GOOD} Logged into Nile as developer {params['NILE_DEVELOPER_EMAIL']}",  # noqa: E501
    )

    instances = await load_instances(
        client=client,
        entity=entity_definition.name,
    )
    required_deployments = to_deployments(instances=instances)

    print(f"{GOOD} Got Flink deployments from Nile: {required_deployments}")

    kubecfg = kubernetes.config.load_config()
    with kubernetes.client.ApiClient(kubecfg) as k8s:
        # using default namespace on K8s for these deployments
        deployment_service = FlinkDeploymentService(client=k8s, namespace="default")
        actual_deployments = await deployment_service.get_all()

        print(f"{GOOD} Got Flink deployments from K8s: {actual_deployments}")

        # stitch Nile and Flink together
        plan = reconcile(required=required_deployments, actual=actual_deployments)

        if os.environ.get("CHECK_STATUS") == "1":
            print(f"{GOOD} Performing only a status check")
            print(f"Pending destruction: {plan.deletion_names} ({len(plan.deletion_names)})")
            print(f"Pending creation: {plan.creation_names} ({len(plan.creation_names)})")
            sys.exit(0)  # thats it, we just checked status

        await synchronize_data_plane(deployment_service, plan=plan)

        from_seq = max((instance.seq for instance in instances), default=0)
        await listen_for_nile_events(
            client=client,
            service=deployment_service,
            entity_type=entity_definition.name,
            from_seq=from_seq,
        )


async def load_instances(client, entity):
    instances = await list_instances_in_workspace.asyncio(
        client=client,
        type=entity,
        workspace=params["NILE_WORKSPACE"],
    )
    print("Loaded instances", instances)
    return instances


def to_deployments(instances):
    return [instance.properties for instance in instances]


async def synchronize_data_plane(
    service: "FlinkDeploymentService",
    plan: "_ReconciliationPlan",
):
    print(f"{THUMBSUP} Performing initial synchronization of control plane and data plane")
    print(plan)

    for each in plan.to_delete:
        await service.delete(each)

    for each in plan.to_create:
        await service.create(each)


async def listen_for_nile_events(
    client: Client,
    service: "FlinkDeploymentService",
    entity_type: str,
    from_seq: int
):
    print(f"{EAR} Listening for events for {entity_type} entities from sequence #{from_seq}")
    async for event in events.on(
        workspace=params["NILE_WORKSPACE"],
        client=client,
        type=entity_type,
        seq=from_seq,
    ):
        print("event:", event)
        if event.after.deleted:
            print(f"{WASTEBASKET} Deleting {entity_type}")
            print(f"{event.after}")
            try:
                await service.delete(event.after.properties)
            except kubernetes.client.exceptions.ApiException as error:
                print(f"{BAD} Unable to delete {entity_type}: {error}")
        else:
            print(f"{NEW} Creating {entity_type}")
            print(f"{event.after}")
            await service.create(event.after.properties)


@define
class FlinkDeploymentService:

    _client: kubernetes.client.ApiClient

    namespace: str

    _k8s_group = "flink.apache.org"
    _k8s_version = "v1beta1"
    _k8s_deployment_plural = "flinkdeployments"

    # NOTE: The k8s client seems like it's not quite ready for asyncio yet.
    #       These calls are therefore really synchronous
    async def get_all(self):
        api = kubernetes.client.CustomObjectsApi(self._client)
        # NOTE: This call is actually synchronous.
        response = api.list_namespaced_custom_object(
            group=self._k8s_group,
            version=self._k8s_version,
            namespace=self.namespace,
            plural=self._k8s_deployment_plural,
        )
        return [_to_api_flink_deployment(each) for each in response["items"]]

    async def create(self, deployment):
        api = kubernetes.client.CustomObjectsApi(self._client)
        api.create_namespaced_custom_object(
            group=self._k8s_group,
            version=self._k8s_version,
            namespace=self.namespace,
            plural=self._k8s_deployment_plural,
            body=self._to_k8s_flink_deployment(deployment),
        )

    async def delete(self, deployment):
        api = kubernetes.client.CustomObjectsApi(self._client)
        name = deployment["metadata"]["name"]
        api.delete_namespaced_custom_object(
            group=self._k8s_group,
            version=self._k8s_version,
            namespace=self.namespace,
            plural=self._k8s_deployment_plural,
            name=name,
        )

    def _to_k8s_flink_deployment(self, api_deployment):
        return {
            "apiVersion": f"{self._k8s_group}/{self._k8s_version}",
            "kind": "FlinkDeployment",
            "metadata": {"name": api_deployment["metadata"]["name"]},
            "spec": {
                "flinkVersion": "v1_14",
                "flinkConfiguration": {
                    "taskmanager.numberOfTaskSlots": str(api_deployment["spec"]["flinkConfiguration"]["taskmanager.numberOfTaskSlots"]),
                },
                "serviceAccount": "flink",
                "jobManager": {
                    "resource": {
                        "cpu": api_deployment["spec"]["jobManager"]["resource"]["cpu"],
                        "memory": api_deployment["spec"]["jobManager"]["resource"]["memory"],
                    }
                },
                "taskManager": {
                    "resource": {
                        "cpu": api_deployment["spec"]["taskManager"]["resource"]["cpu"],
                        "memory": api_deployment["spec"]["taskManager"]["resource"]["memory"],
                    },
                    "replicas": api_deployment["spec"]["taskManager"].get("replicas"),
                },
                "job": {
                    "jarURI": api_deployment["spec"]["job"]["jarURI"],
                    "parallelism": api_deployment["spec"]["job"]["parallelism"],
                    "upgradeMode": api_deployment["spec"]["job"]["upgradeMode"].lower()
                }
            }
        }


def _to_api_flink_deployment(k8s_deployment):
    return {
        "metadata": {
            "name": k8s_deployment["metadata"]["name"]
        },
        "spec": {
            "flinkConfiguration": {
                "taskmanager.numberOfTaskSlots": k8s_deployment["spec"]["flinkConfiguration"]["taskmanager.numberOfTaskSlots"],
            },
            "job": {
                "state": k8s_deployment["spec"].get("jobState"),
                "dockerImage": k8s_deployment["spec"].get("image"),
                "environment": "local",
                "parallelism": 1,
                "upgradeMode": k8s_deployment["spec"].get("upgradeMode"),
            },
            "jobManager": {
                "resource": {
                    "cpu": k8s_deployment["spec"]["jobManager"]["resource"]["cpu"],
                    "memory": k8s_deployment["spec"]["jobManager"]["resource"]["memory"],
                    }
            },
            "taskManager": {
                "resource": {
                    "cpu": k8s_deployment["spec"]["taskManager"]["resource"]["cpu"],
                    "memory": k8s_deployment["spec"]["taskManager"]["resource"]["memory"],
                    },
                "replicas": k8s_deployment["spec"]["taskManager"].get("replicas"),
            },
        },
        "status": {
            "jobStatus": {
                "jobID": k8s_deployment["metadata"]["uid"],
                "state": k8s_deployment.get("status", {}).get("jobStatus", {}).get("state"),
            },
        },
    }


@define
class _ReconciliationPlan:

    to_create: list
    to_delete: list

    @property
    def creation_names(self):
        return [each["metadata"]["name"] for each in self.to_create]

    @property
    def deletion_names(self):
        return [each["metadata"]["name"] for each in self.to_delete]


def reconcile(required, actual):
    required = {each["metadata"]["name"]: each for each in required}
    actual = {each["metadata"]["name"]: each for each in actual}
    print(required, actual)

    to_create, to_delete = [], []

    for each in actual.values():
        found = required.pop(each["metadata"]["name"], None)
        if found is None:
            to_delete.append(each)

    for each in required.values():
        found = actual.pop(each["metadata"]["name"], None)
        if found is None:
            to_create.append(each)

    return _ReconciliationPlan(to_create=to_create, to_delete=to_delete)


asyncio.run(run())
