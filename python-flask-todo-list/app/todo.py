from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, session
)
from werkzeug.exceptions import abort
from datetime import datetime

from app.auth import login_required

from . import nile

bp = Blueprint('todo', __name__)

@bp.route('/')
def index():
    token = session.get('token')
    nile_client = nile.getNileClient()

    todos = nile_client.get_instances("tasks", token, with_envelope=False)
    print (todos)
    return render_template('todo/index.html', todos=todos)

@bp.route('/add', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        is_private = 'is_private' in request.form.keys()
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
            token = session.get('token')
            nile_client = nile.getNileClient()
            task = {
                    "created": str(datetime.now()),
                    "creator": g.email,
                    "due_date": parsed_due_date.strftime("%d-%m-%Y"),
                    "task_name": task_name,
                    "status": status,
                    "is_private": is_private
                }
            nile_client.create_instance("tasks", task, token)
            return redirect(url_for('todo.index'))
    return render_template('todo/create.html')

def get_task(id, check_creator=True):
    nile_client = nile.getNileClient()
    token = session.get('token')
    task = nile_client.get_instance("tasks", id, token, with_envelope=False)
    if task is None:
        abort(404, f"Task id {id} doesn't exist.")

    return task

@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    task = get_task(id)
    print(task)
    if request.method == 'POST':
        task_name = request.form['task_name']
        due_date = request.form['due_date']
        status = request.form['status']
        is_private = 'is_private' in request.form.keys()
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
            token = session.get('token')
            nile_client = nile.getNileClient()
            task = {
                "created": task['created'],
                "creator": task['creator'],
                "due_date": parsed_due_date.strftime("%d-%m-%Y"),
                "task_name": task_name,
                "status": status,
                "is_private": is_private
            }
            nile_client.update_instance( "tasks", id, task, token)
            return redirect(url_for('todo.index'))

    return render_template('todo/update.html', task=task)

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    get_task(id)
    token = session.get('token')
    nile_client = nile.getNileClient()
    nile_client.delete_instance("tasks", id, token)
    return redirect(url_for('todo.index'))