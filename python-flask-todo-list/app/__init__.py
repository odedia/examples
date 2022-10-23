import os
import sys

from flask import Flask
from emoji import emojize
from dotenv import load_dotenv

from nile-api import AuthenticatedClient, Client

GOOD = emojize(":check_mark_button:")
BAD = emojize(":red_circle:")
DART = emojize(":dart:", language="alias")
ARROW_RIGHT = emojize(":arrow_right:", language="alias")

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)

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

    SECRET_KEY = 'dev', # Replace in production!
    DATABASE = os.path.join(app.instance_path, 'todo.sqlite'),

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    print("Database: "+ app.config['DATABASE'])
    print("Nile url: "+ app.config['NILE_URL'])

    # Initializing Nile client
    NILE_CLIENT = Client(base_url=params["NILE_URL"])

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    from . import auth, todo
    app.register_blueprint(auth.bp)
    app.register_blueprint(todo.bp)
    app.add_url_rule('/', endpoint='index')

    return app
