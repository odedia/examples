from re import T
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, session
)
from werkzeug.exceptions import abort
from datetime import datetime

from webapp.auth import login_required

from nile import nile

bp = Blueprint('clusters', __name__)
nile_client = nile.getNileClient()

@bp.route('/', methods=('GET', 'POST'))
def index():
    token = session.get('token')
    user = g.user
    if user:
        if request.method == 'POST':
            org_id = request.form['select_org']
            nile_client.set_current_org(token, org_id)
        clusters = nile_client.get_instances("clusters", token)
        orgs = user.orgs
        current_org = user.current_org_id
        code = nile_client.get_invites(token)[0]['code']
    else:
        clusters = []
        orgs = []
        current_org = None
        code = None
    return render_template('clusters/index.html', clusters=clusters, orgs = orgs, current_org=current_org, code=code)

@bp.route('/add', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        token = session.get('token')
        cluster = {
            "cluster_name": request.form['cluster_name'],
        }
        nile_client.create_instance("clusters", cluster, token)
        return redirect(url_for('clusters.index'))
    return render_template('clusters/create.html')

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    token = session.get('token')
    nile_client.delete_instance(entity="clusters", id = id, token=token, soft_delete=True)
    return redirect(url_for('clusters.index'))