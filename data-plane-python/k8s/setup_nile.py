#! /usr/bin/env python3
from pathlib import Path
from pprint import pprint
import asyncio
import json
import os
import sys

from dotenv import load_dotenv
from emoji import emojize
import yaml

from nile_api import AuthenticatedClient, Client
from nile_api.models.create_entity_request import CreateEntityRequest
from nile_api.models.create_organization_request import CreateOrganizationRequest
from nile_api.models.create_user_request import CreateUserRequest
from nile_api.models.create_workspace_request import CreateWorkspaceRequest
from nile_api.models.json_schema_instance import JsonSchemaInstance
from nile_api.models.login_info import LoginInfo
from nile_api.api.developers import create_developer, login_developer
from nile_api.api.entities import (
    create_entity, list_entities, create_instance, list_instances, get_open_api
)
from nile_api.api.organizations import create_organization, list_organizations
from nile_api.api.workspaces import create_workspace, list_workspaces

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")

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
    print("\nLogging into Nile at {NILE_URL}, workspace {NILE_WORKSPACE}, as developer {NILE_DEVELOPER_EMAIL}".format_map(params))  # noqa: E501

    unauthenticated = Client(base_url=params["NILE_URL"])
    response = await create_developer.asyncio_detailed(
        client=unauthenticated,
        json_body=CreateUserRequest(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        ),
    )
    if response.status_code == 400:
        message = json.loads(response.content)["message"]
        if message == "user already exists":
            print(f"Developer {params['NILE_DEVELOPER_EMAIL']} already exists")
        else:
            print(f"Failed to create a user: {message}")
            sys.exit(1)
    else:
        developer = response.parsed
        print(f"{GOOD} Created developer {developer}")

    token = await login_developer.asyncio(
        client=unauthenticated,
        json_body=LoginInfo(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        ),
    )

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

    print(
        f"{GOOD} Logged into Nile as developer {params['NILE_DEVELOPER_EMAIL']}",  # noqa: E501
    )

    # Check if workspace exists, create if not
    workspaces = await list_workspaces.asyncio(client=client)
    workspace = next(
        (each for each in workspaces if each.name == params["NILE_WORKSPACE"]),
        None
    )
    if workspace is not None:
        print(f"{GOOD} Workspace {workspace.name!r} exists")
    else:
        response = await create_workspace.asyncio_detailed(
            client=client,
            json_body=CreateWorkspaceRequest(name=params["NILE_WORKSPACE"]),
        )
        if response.status_code == 400:
            print(f"{BAD} Workspace {params['NILE_WORKSPACE']!r} already exists, but must not be accessible by this developer")
            sys.exit(1)
        workspace = response.parsed
        print(f"{GOOD} Created workspace {workspace.name!r}")

    # Check if entity exists, create if not
    entities = await list_entities.asyncio(client=client, workspace=workspace.name)
    entity = next(
        (each for each in entities if each.name == entity_definition.name),
        None
    )
    if entity is not None:
        print(f"{GOOD} Entity {entity.name!r} exists")
    else:
        entity = await create_entity.asyncio(
            workspace=workspace.name,
            client=client,
            json_body=entity_definition,
        )
        print(f"{GOOD} Created entity {entity.name!r}")

    # Check if organization exists, create if not
    organizations = await list_organizations.asyncio(client=client, workspace=workspace.name)
    organization = next(
        (each for each in organizations if each.name == params["NILE_ORGANIZATION_NAME"]),
        None
    )
    if organization is not None:
        print(f"{GOOD} Organization {organization.name!r} exists with id {organization.id}")
    else:
        organization = await create_organization.asyncio(
            workspace=workspace.name,
            client=client,
            json_body=CreateOrganizationRequest(name=params["NILE_ORGANIZATION_NAME"]),
        )
        print(f"{GOOD} Created organization {organization.name!r}")

    tenant_id = organization.id

    # Check if instance exists, create if not
    instances = await list_instances.asyncio(
        client=client,
        workspace=workspace.name,
        org=tenant_id,
        type=entity_definition.name,
    )
    instance = next(
        (each for each in instances if each.type == entity_definition.name),
        None
    )
    if instance is not None:
        print(f"{GOOD} Entity instance {entity_definition.name!r} exists with id {instance.id}")
    else:
        instance = await create_instance.asyncio(
            org=tenant_id,
            workspace=workspace.name,
            type=entity_definition.name,
            client=client,
            json_body=JsonSchemaInstance.from_dict(
                {
                    "spec": {
                        "job": {
                            "jarURI": "local:///opt/flink/examples/streaming/StateMachineExample.jar",
                            "parallelism": 2,
                            "upgradeMode": "STATELESS"
                        },
                        "jobManager": {
                            "replicas": 2,
                            "resource": {
                                "cpu": 1,
                                "memory": "2048m"
                            },
                        },
                        "taskManager": {
                            "resource": {
                                "cpu": 1,
                                "memory": "2048m"
                            },
                        },
                        "flinkConfiguration": {
                            "taskmanager.numberOfTaskSlots": 2
                        },
                    },
                    "metadata": {
                        "name": "basic-example"
                    },
                },
            ),
        )
        print(f"{GOOD} Created instance {instance!r}")
    #

    print("The following instances exist:")
    instances = await list_instances.asyncio(
        client=client,
        workspace=workspace.name,
        org=tenant_id,
        type=entity_definition.name,
    )
    pprint([instance.to_dict() for instance in instances])

    response = await get_open_api.asyncio_detailed(
        client=client,
        workspace=workspace.name,
        type=entity_definition.name,
    )
    spec = yaml.safe_load(response.content)
    flink_path.parent.joinpath(f"{flink_path.stem}.yaml").write_text(
        yaml.dump(spec),
    )


asyncio.run(run())
