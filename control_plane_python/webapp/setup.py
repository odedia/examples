import click
from flask import current_app, g
from flask.cli import with_appcontext
from nile import nile

@click.command('init-entities')
@with_appcontext
def init_entities_command():
    """Setup the workspace entities"""
    nile_client = nile.getNileClient()

    click.echo('creating entities')
    with current_app.open_resource('clusters.json') as f:
        nile_client.create_entity(f.read().decode('utf8'))
    click.echo('entities successfully created')

def init_app(app):
    app.cli.add_command(init_entities_command)