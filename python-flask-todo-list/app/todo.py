from flask import (
    Blueprint, current_app, flash, g, redirect, render_template, request, url_for, session
)
from werkzeug.exceptions import abort
from datetime import datetime

from app.auth import login_required

from nile_api.api.entities import list_instances, get_instance, create_instance, update_instance, delete_instance
from nile_api.models.json_schema_instance import JsonSchemaInstance
from nile_api.client import AuthenticatedClient

bp = Blueprint('todo', __name__)

@bp.route('/')
@login_required
def index():
    nile_workspace = current_app.config['NILE_WORKSPACE']
    nile_url = current_app.config['NILE_URL']
    token = session['token']
    resp = list_instances.sync_detailed(nile_workspace, session['curr_org'], "tasks", 
        client = AuthenticatedClient(nile_url,token)
    )
    print (resp)
    todos = resp.parsed
    if todos is None:
        todos=[]
    return render_template('todo/index.html', todos=todos)

@bp.route('/add', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        is_private = 'is_private' in request.form.keys()
        nile_workspace = current_app.config['NILE_WORKSPACE']
        nile_url = current_app.config['NILE_URL']
        error = None

        if not task_name:
            error = 'Task name is required.'

        try:
            parsed_due_date = datetime.strptime(due_date, "%d-%m-%Y")
        except ValueError:
           error = 'date "' + due_date + '" must follow dd-mm-YYYY format'

        if error is not None:
            flash(error)
        else:
            nile_client = AuthenticatedClient(nile_url, session['token'])
            task = {
                    "created": str(datetime.now()),
                    "creator": session['email'],
                    "due_date": parsed_due_date.strftime("%d-%m-%Y"),
                    "task_name": task_name,
                    "status": status,
                    "is_private": is_private
                }
            create_instance.sync(nile_workspace, session['curr_org'], "tasks", client=nile_client, 
                json_body=JsonSchemaInstance.from_dict(task)
            )
            return redirect(url_for('todo.index'))
    return render_template('todo/create.html')

def get_task(id, check_creator=True):
    nile_workspace = current_app.config['NILE_WORKSPACE']
    nile_url = current_app.config['NILE_URL']
    nile_client = AuthenticatedClient(nile_url, session['token'])
    task = get_instance.sync(nile_workspace, session['curr_org'], "tasks", id, client=nile_client)
    #task = nile_client.get_instance("tasks", id, token, with_envelope=False)
    if task is None:
        abort(404, f"Task id {id} doesn't exist.")

    return task

@bp.route('/<string:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    task = get_task(id)
    print(task)
    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        is_private = 'is_private' in request.form.keys()
        nile_workspace = current_app.config['NILE_WORKSPACE']
        nile_url = current_app.config['NILE_URL']
        nile_client = AuthenticatedClient(nile_url, session['token'])
        error = None

        if not task_name:
            error = 'Task name is required.'

        try:
            parsed_due_date = datetime.strptime(due_date, "%d-%m-%Y")
        except ValueError:
           error = 'date "' + due_date + '" must follow dd-mm-YYYY format'

        if error is not None:
            flash(error)
        else:
            task = {
                "created": task.created.isoformat(),
                "creator": task.properties['creator'],
                "due_date": parsed_due_date.strftime("%d-%m-%Y"),
                "task_name": task_name,
                "status": status,
                "is_private": is_private
            }
            update_instance.sync(nile_workspace, session['curr_org'], "tasks", id, client=nile_client, json_body=JsonSchemaInstance.from_dict(task))
            return redirect(url_for('todo.index'))

    return render_template('todo/update.html', task=task)

@bp.route('/<string:id>/delete', methods=('POST',))
@login_required
def delete(id):
    nile_workspace = current_app.config['NILE_WORKSPACE']
    nile_url = current_app.config['NILE_URL']
    nile_client = AuthenticatedClient(nile_url, session['token'])
    get_task(id)
    delete_instance.sync_detailed(nile_workspace, session['curr_org'], "tasks", id, client=nile_client)
    return redirect(url_for('todo.index'))