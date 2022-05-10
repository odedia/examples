import os
import logging
logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))

from flask import Flask

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    # for session encryption
    app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Initializing Nile client for a specific workspace
    # developer credentials are used only to set up the workspace and create entities
    from nile import nile
    url = os.environ.get('NILE_URL', 'http://localhost:8080')
    workspace = os.environ.get('NILE_WORKSPACE','control-plane')
    key = os.environ.get('NILE_KEY','set-dev-credentials')
    secret = os.environ.get('NILE_SECRET','set-dev-credentials')
    nile._nile_client = nile.NileClient(url, workspace, key, secret)
    
    # register command to init the entities:
    from . import setup
    setup.init_app(app)

    # register blueprints with the app views
    from . import auth, clusters
    app.register_blueprint(auth.bp)
    app.register_blueprint(clusters.bp)
    app.add_url_rule('/', endpoint='index')

    return app
