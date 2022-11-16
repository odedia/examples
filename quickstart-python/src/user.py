#! /usr/bin/env python

import os
import sys

from dotenv import load_dotenv
from emoji import emojize

from nile_api import AuthenticatedClient, Client
from nile_api.api.developers import login_developer
from nile_api.api.users import create_user, list_users
from nile_api.models.login_info import LoginInfo
from nile_api.models.create_user_request import CreateUserRequest

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

    email = "shaun@colton.demo"
    password = "password"

    # Check if user exists, create if not
    users = list_users.sync(client=client, workspace=params["NILE_WORKSPACE"])
    user = next((each for each in users if each.email == email), None)
    if user is not None:
        print(f"{DART} User {user.email!r} exists")
    else:
        user = create_user.sync(
            workspace=params["NILE_WORKSPACE"],
            client=client,
            json_body=CreateUserRequest(email=email, password=password),
        )
        print(f"{GOOD} Created user {user.email!r}")


if __name__ == "__main__":
    run()
