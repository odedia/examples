#! /usr/bin/env python

import json
import os
import sys

from pathlib import Path
from dotenv import load_dotenv
from emoji import emojize

from encryption import set_secret, get_secret

from nile_api import AuthenticatedClient, Client
from nile_api.api.users import login_user
from nile_api.api.entities import update_instance, list_instances, get_instance
from nile_api.api.organizations import list_organizations
from nile_api.models.json_schema_instance import JsonSchemaInstance
from nile_api.models.update_instance_request import UpdateInstanceRequest
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
        "ETL_SNOWFLAKE_URL",
        "ETL_SNOWFLAKE_KEY",
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
        print(f"{BAD} Could not map instance name {name} to an ID")
        sys.exit(1)

    instance_id = instance.id
    instance_properties = instance.properties

    # Update instance with destination properties (all except credentials)
    dst_type = 'snowflake'
    dst_user = 'confluent'
    dst_db = 'MYDB3'
    dst_schema = 'PUBLIC'
    instance_properties.additional_properties.update({ "dst_type" : dst_type })
    instance_properties.additional_properties.update({ "dst_user" : dst_user })
    instance_properties.additional_properties.update({ "dst_db" : dst_db })
    instance_properties.additional_properties.update({ "dst_schema" : dst_schema })
    data = UpdateInstanceRequest(properties = instance_properties)
    response = update_instance.sync(
        org=org_id,
        workspace=params["NILE_WORKSPACE"],
        type=NILE_ENTITY_NAME,
        client=client,
        id=instance_id,
        json_body=data,
    )
    #print(response)
    print(f"{GOOD} Updated entity instance {instance_id}")

    # Save credentials to local keyring
    #dst_url = 'https://abc.us-central1.gcp.snowflakecomputing.com:443'
    #dst_key = 'myKey1'
    dst_url = params["ETL_SNOWFLAKE_URL"]
    dst_key = params["ETL_SNOWFLAKE_KEY"]
    set_secret(instance_id, 'dst_url', dst_url);
    set_secret(instance_id, 'dst_key', dst_key);

    # Show values
    # Get Nile instance info
    instance = get_instance.sync(
        client=client,
        workspace=params["NILE_WORKSPACE"],
        org=org_id,
        type=NILE_ENTITY_NAME,
        id=instance_id,
    )
    print(f"{GOOD} Instance: {json.dumps(instance.to_dict(), indent=2)}")
    # Get secrets
    print(f"{GOOD} Secrets: {get_secret(instance_id, 'src_apiKey')}, {get_secret(instance_id, 'src_apiSecret')}")
    #print(get_secret(instance_id, 'dst_user'));
    #print(get_secret(instance_id, 'dst_key'));


if __name__ == "__main__":
    run()
