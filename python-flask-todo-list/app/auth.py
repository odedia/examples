from email.policy import default
import functools
from httpx import Auth
import jwt
import json

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for,current_app
)

from nile_api.api.users import create_user,login_user, validate_user
from nile_api.models.create_user_request import CreateUserRequest
from nile_api.models.login_info import LoginInfo
from nile_api.models.token import Token
from nile_api.models.error import Error
from nile_api.client import AuthenticatedClient, Client
from nile_api.api.organizations import list_organizations, create_organization
from nile_api.models.create_organization_request import CreateOrganizationRequest
from nile_api.models.organization import Organization

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/signup', methods=('GET', 'POST'))
def signup():
    nile_workspace = current_app.config.get("NILE_WORKSPACE")
    nile_url = current_app.config.get("NILE_URL")
    nile_client = Client(nile_url)
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        error = None

        if not email:
            error = 'Email is required.'
        elif not password:
            error = 'Password is required.'

        if error is None:
            resp = create_user.sync_detailed(nile_workspace, client = nile_client, json_body = CreateUserRequest(email, password))
            user = resp.parsed
            if user is not None:
                return redirect(url_for('index'))
            else:
                flash("Failed to create user " + email + " due to " + resp)

    return render_template('auth/signup.html')

@bp.route('/login', methods=('GET', 'POST'))
def login():
    nile_workspace = current_app.config.get("NILE_WORKSPACE")
    nile_url = current_app.config.get("NILE_URL")
    nile_client = Client(nile_url)
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        resp = login_user.sync(nile_workspace, client = nile_client, json_body = LoginInfo(email, password))
        print(resp)
        if isinstance(resp, Token):
            session['token'] = resp.token
            session['email'] = jwt.decode(resp.token, algorithms=["HS256"],  options={"verify_signature": False})["sub"] # token subject is the user email
            orgs = list_organizations.sync(nile_workspace, client = AuthenticatedClient(nile_url, resp.token))
            if orgs is None or orgs.count == 0:
                return redirect(url_for('auth.create_org'))
            session['orgs'] = json.dumps([org.__dict__ for org in orgs], default=str)
            session['curr_org'] = orgs[0].id
            return redirect(url_for('index'))
        if isinstance(resp, Error) or resp is None:
            flash("Failed to login user " + email + " due to " + resp)

    return render_template('auth/login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@bp.route('create_org',methods=('GET', 'POST'))
def create_org():
    nile_workspace = current_app.config.get("NILE_WORKSPACE")
    nile_url = current_app.config.get("NILE_URL")
    if request.method == 'POST':
        org_name = request.form['org_name']
        resp = create_organization.sync(nile_workspace, json_body=CreateOrganizationRequest(org_name), 
            client = AuthenticatedClient(nile_url, session['token']))
        if resp:
            session['orgs'] = [].append(json.dumps(resp), default=str)
            session['current_org'] = resp.id
            return redirect(url_for('index'))
        else:
            flash("Failed to create organization")
    return render_template('auth/create_org.html')  

def login_required(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if session.get('token') is None:
            return redirect(url_for('auth.login'))
        else:
            nile_workspace = current_app.config.get('NILE_WORKSPACE')
            nile_url = current_app.config.get('NILE_URL')
            resp = validate_user.sync_detailed(nile_workspace, client = AuthenticatedClient(nile_url,session['token']), json_body = Token(session['token']))
            print(resp)
            if isinstance(resp.parsed, Error):
                return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view