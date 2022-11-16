#! /usr/bin/env python

from pathlib import Path
import json
import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.developers import login_developer
from nile_api.api.entities import create_entity, list_entities
from nile_api.models.login_info import LoginInfo
from nile_api.models.create_entity_request import CreateEntityRequest

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
NILE_ENTITY_NAME = "DB"

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)


path = Path(__file__).absolute().parent.parent.parent.joinpath(
    "usecases",
    NILE_ENTITY_NAME,
    "entity_definition.json",
)
try:
    contents = path.read_text()
except FileNotFoundError:
    print(f"{BAD} Did you check that {path} exists?")
    sys.exit(1)
else:
    entity_definition = CreateEntityRequest.from_dict(json.loads(contents))


def run():
    if not os.environ.get("NILE_WORKSPACE_ACCESS_TOKEN"):
        if not os.environ.get("NILE_DEVELOPER_EMAIL") or not os.environ.get("NILE_DEVELOPER_PASSWORD"):
            print(
                f"{BAD} Error: please provide NILE_WORKSPACE_ACCESS_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env . See .env.defaults for more info and copy it to .env with your values"
            )
            sys.exit(1)
        else:
            token = login_developer.sync(
                client=Client(base_url=params["NILE_URL"]),
                json_body=LoginInfo(
                    email=os.environ.get("NILE_DEVELOPER_EMAIL"),
                    password=os.environ.get("NILE_DEVELOPER_PASSWORD"),
                ),
            )
            devToken = token.token
    else:
        devToken = os.environ.get("NILE_WORKSPACE_ACCESS_TOKEN")
    client = AuthenticatedClient(base_url=params["NILE_URL"], token=devToken)

    print(f"\n{ARROW_RIGHT} Logged into Nile as developer")

    # Check if entity exists, create if not
    entities = list_entities.sync(client=client, workspace=params["NILE_WORKSPACE"])
    entity = next(
        (each for each in entities if each.name == entity_definition.name),
        None,
    )
    if entity is not None:
        print(f"{DART} Entity {entity.name!r} exists")
    else:
        entity = create_entity.sync(
            workspace=params["NILE_WORKSPACE"],
            client=client,
            json_body=entity_definition,
        )
        print(f"{GOOD} Created entity {entity.name!r}")


if __name__ == "__main__":
    run()
