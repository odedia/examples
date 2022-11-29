#! /usr/bin/env python

import json
import os
import sys

from pathlib import Path
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
    for param in [
        "NILE_URL",
        "NILE_WORKSPACE",
    ]
}
NILE_ENTITY_NAME = "ETL"

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)

def login_first_predefined_user ():
    users_path = Path(__file__).absolute().parent.parent.parent.joinpath(
        "usecases",
        NILE_ENTITY_NAME,
        "init",
        "users.json",
    )
    try:
        contents = users_path.read_text()
    except FileNotFoundError:
        print(f"{BAD} could not find {users_path}")
        sys.exit(1)
    else:
        # Load first user only
        user, *_ = json.loads(contents)

    email = user["email"]
    password = user["password"]

    token = login_user.sync(
        client=Client(base_url=params["NILE_URL"]),
        workspace=params["NILE_WORKSPACE"],
        json_body=LoginInfo(email=email, password=password),
    )

    print(f"\n{ARROW_RIGHT} Logged into Nile as user {email}")
    #print(f"export NILE_USER_AUTH_TOKEN={token.token}")

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)
    return client

def get_org_id(client):
    users_path = Path(__file__).absolute().parent.parent.parent.joinpath(
        "usecases",
        NILE_ENTITY_NAME,
        "init",
        "users.json",
    )
    try:
        contents = users_path.read_text()
    except FileNotFoundError:
        print(f"{BAD} could not find {users_path}")
        sys.exit(1)
    else:
        # Load first user only
        user, *_ = json.loads(contents)

    org_name = user["org"]

    organizations = list_organizations.sync(
        workspace=params["NILE_WORKSPACE"],
        client=client,
    )
    matching = (
        organization
        for organization in organizations
        if organization.name == org_name
    )
    org = next(matching, None)
    if org is not None:
        print(f"{GOOD} Mapped organization name {org.name} to ID {org.id}")
    else:
        print(
            f"{BAD} Could not map organization name {org_name} to an ID"  # noqa: E501
        )
        sys.exit(1)
    return org.id


def run():

    # Login as first predefined user
    client = login_first_predefined_user()

    org_id = get_org_id(client)

    # Check if entity instance exists, create if not
    name="test1"
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
            and each.properties["name"] == name
        ),
        None,
    )
    if instance is not None:
        print(f"{GOOD} Entity instance {NILE_ENTITY_NAME!r} exists where name is {name} (id: {instance.id})")
    else:
        instance = create_instance.sync(
            org=org_id,
            workspace=params["NILE_WORKSPACE"],
            type=NILE_ENTITY_NAME,
            client=client,
            json_body=JsonSchemaInstance.from_dict(
                dict(
                    name="test1",
                    status="Submitted",
                    secrets_url="keyring",
                ),
            ),
        )
        print(f"{GOOD} Created entity instance: {json.dumps(instance.to_dict(), indent=2)}")


if __name__ == "__main__":
    run()
