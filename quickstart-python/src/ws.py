#! /usr/bin/env python

import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.developers import login_developer
from nile_api.api.workspaces import create_workspace, list_workspaces
from nile_api.models.login_info import LoginInfo
from nile_api.models.create_workspace_request import CreateWorkspaceRequest

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
        "NILE_DEVELOPER_EMAIL",
        "NILE_DEVELOPER_PASSWORD",
    ]
}

for name, value in params.items():
    if not value:
        print(
            f"{BAD} Error: missing environment variable {name}. See .env.defaults for more info and copy it to .env with your values",  # noqa: E501
        )
        sys.exit(1)


def run():
    response = login_developer.sync(
        client=Client(base_url=params["NILE_URL"]),
        json_body=LoginInfo(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        ),
    )
    token = getattr(response, "token", None)
    if token is None:
        print(f"{BAD} Error: Failed to login to Nile as developer {params['NILE_DEVELOPER_EMAIL']}: {response.message}")
        sys.exit(1)

    client = AuthenticatedClient(base_url=params["NILE_URL"], token=token)

    print(f"\n{ARROW_RIGHT} Logged into Nile as developer {params['NILE_DEVELOPER_EMAIL']}")
    print(f"export NILE_DEVELOPER_AUTH_TOKEN={token}")

    workspaces = list_workspaces.sync(client=client)
    workspace = next(
        (each for each in workspaces if each.name == params["NILE_WORKSPACE"]),
        None,
    )
    if workspace is not None:
        print(f"{DART} Workspace {workspace.name!r} exists")
    else:
        response = create_workspace.sync_detailed(
            client=client,
            json_body=CreateWorkspaceRequest(name=params["NILE_WORKSPACE"]),
        )
        if response.parsed is None:
            print(f"{BAD} Workspace {params['NILE_WORKSPACE']!r} already exists (workspace names are globally unique)")
            sys.exit(1)
        workspace = response.parsed
        print(f"{GOOD} Created workspace {workspace.name!r}")


if __name__ == "__main__":
    run()
