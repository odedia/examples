import os
import sys
import json

from flask import Flask, g, current_app
from emoji import emojize
from dotenv import load_dotenv

from nile_api import AuthenticatedClient, Client
from nile_api.models.login_info import LoginInfo
from nile_api.api.developers import login_developer
from nile_api.models.create_entity_request import CreateEntityRequest
from nile_api.api.entities import create_entity

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
DART = emojize(":dart:", language="alias")
ARROW_RIGHT = emojize(":arrow_right:", language="alias")

def create_app(test_config=None):

    # create and configure the app
    app = Flask(__name__)
    app.config.from_mapping(
         SECRET_KEY="dev", # this encrypts sessions. use actual secret in production
    )

    # Nile configuration
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
    
    app.config.from_mapping(params)

    print(DART + " Nile url: " + params["NILE_URL"] + "; Workspace: " + params['NILE_WORKSPACE'])

    # Login as developer
    token = login_developer.sync(client = Client(base_url=params["NILE_URL"]), 
        info = LoginInfo(
            email=params["NILE_DEVELOPER_EMAIL"],
            password=params["NILE_DEVELOPER_PASSWORD"],
        )
    )

    # client authenticated as a developer
    nile_dev_client = AuthenticatedClient(base_url=params["NILE_URL"], token=token.token)

    # Create entity for tasks to do
    with app.open_resource('tasks.json') as f:
        entityReq = CreateEntityRequest.from_dict(json.load(f))
        resp = create_entity.sync_detailed(params["NILE_WORKSPACE"], client = nile_dev_client, json_body = entityReq)
        if resp.parsed:
            print(GOOD + " Created entity for storing tasks")
        else:
            print(BAD + " failed to create tasks entity due to " + resp.content.decode("utf-8"))

    from . import auth, todo
    app.register_blueprint(auth.bp)
    app.register_blueprint(todo.bp)
    app.add_url_rule('/', endpoint='index')

    return app
