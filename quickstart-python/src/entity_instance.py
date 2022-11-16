#! /usr/bin/env python

import json
import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.users import login_user
from nile_api.api.entities import create_instance, list_instances
from nile_api.api.organizations import list_organizations
from nile_api.models.json_schema_instance import JsonSchemaInstance
from nile_api.models.login_info import LoginInfo

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
DART = emojize(":dart:", language="alias")
ARROW_RIGHT = emojize(":arrow_right:", language="alias")

load_dotenv(override=True)
params = {
    param: os.environ.get(param)
    for param in ["NILE_URL", "NILE_WORKSPACE"]
}
NILE_ENTITY_NAME = "DB"

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)


def run():
    email = "shaun@colton.demo"
    password = "password"

    token = login_user.sync(
        client=Client(base_url=params["NILE_URL"]),
        workspace=params["NILE_WORKSPACE"],
        json_body=LoginInfo(email=email, password=password),
    )

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

    print(f"\n{ARROW_RIGHT} Logged into Nile as user {email}")
    #print(f"export NILE_USER_AUTH_TOKEN={token.token}")

    # Check if org exists, create if not
    org_name = "Colton Labs"
    organizations = list_organizations.sync(client=client, workspace=params["NILE_WORKSPACE"])
    organization = next(
        (each for each in organizations if each.name == org_name),
        None,
    )
    if organization is not None:
        org_id = organization.id
        print(f"{GOOD} Organization {organization.name!r} exists with id {org_id}")
    else:
        print(f"{BAD} Cannot get orgID from {org_name}")
        sys.exit(1)

    # Check if entity instance exists, create if not
    db_name = "myDB-products"
    cloud = "gcp"
    environment = "prod"
    size = 100

    instances = list_instances.sync(
        client=client,
        workspace=params["NILE_WORKSPACE"],
        org=org_id,
        type=NILE_ENTITY_NAME,
    )
    instance = next(
        (
            each for each in instances
            if each.type == NILE_ENTITY_NAME
            and each.properties["dbName"] == db_name
        ),
        None,
    )
    if instance is not None:
        print(f"{GOOD} Entity instance {NILE_ENTITY_NAME!r} exists where dbName is {db_name} (id: {instance.id})")
    else:
        instance = create_instance.sync(
            org=org_id,
            workspace=params["NILE_WORKSPACE"],
            type=NILE_ENTITY_NAME,
            client=client,
            json_body=JsonSchemaInstance.from_dict(
                dict(
                    dbName=db_name,
                    cloud=cloud,
                    environment=environment,
                    size=size,
                    connection=f"server-{db_name}:3306",
                    status="Up",
                ),
            ),
        )
        print(f"{GOOD} Created entity instance: {json.dumps(instance.to_dict(), indent=2)}")


if __name__ == "__main__":
    run()
