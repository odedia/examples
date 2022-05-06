from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, session
)
from werkzeug.exceptions import abort
from datetime import datetime

from app.auth import login_required

from . import nile

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
        clusters = nile_client.get_instances("clusters-v2", token, with_envelope=False)
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
            "creator": g.user.email,
            "created": str(datetime.now()),
            "cluster_name": request.form['cluster_name'],
            "status": "create_requested",
            "updated": str(datetime.now())
        }
        nile_client.create_instance("clusters-v2", cluster, token)
        return redirect(url_for('clusters.index'))
    return render_template('clusters/create.html')

def get_cluster(id):
    token = session.get('token')
    cluster = nile_client.get_instance("clusters-v2", id, token, with_envelope=False)
    if cluster is None:
        abort(404, f"Cluster id {id} doesn't exist.")

    return cluster

@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    cluster = get_cluster(id)
    cluster['status'] = "delete_requested"
    cluster['updated'] = str(datetime.now())
    token = session.get('token')
    nile_client.update_instance("clusters-v2", id, cluster, token)
    return redirect(url_for('clusters.index'))