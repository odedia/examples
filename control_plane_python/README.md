# Example Control Plane - Built on Nile

This project implements a control plane that can manage MySQL clusters in multiple VPCs. It is composed of two parts:
1. Multi-tenant webapp for cluster management. Clusters belong to organizations (tenants). Users can create organizations and invite others. Authenticated users can create and delete clusters for their organizations.
2. Agent that runs in the control-plane customer account or VPC and carries out create/delete commands on behalf of an organization.

## To run this project:

0. Install dependencies:
```
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

### To run the control plane webapp:

1. Set up the environment:
```
export NILE_URL=http://localhost:8080
export NILE_WORKSPACE=mysql-control-plane
export NILE_KEY=gwen@cplane.dev
export NILE_SECRET=gwensecret
export FLASK_APP=webapp
export FLASK_ENV=development
```

Note that the key and secret are the credentials that you, as a developer, use to access Nile. You should have gotten them from your friends at Nile (or signed up via Nile's website). This is used to set up the "clusters" entity for your workspace.

2. Initialize the workspace for the project:
```
flask init-entities
```

The run Flask:
```
flask run
```

### To run the agent:
1. Set up the environment:
```
export NILE_URL=http://localhost:8080
export NILE_WORKSPACE_ID=13 
export NILE_TENANT_USERNAME=gwen@gamma.com 
export NILE_TENANT_PASSWORD=foobar
export MYSQL_DEFAULT_PWD=changeme 
export AWS_PROFILE=GwenPrivate
```

This is likely be done by the tentant since the agent runs in their VPC with their credentials - in order to guarantee that the agent will never create the wrong cluster for the wrong customer. The only detail that you will need to give them is the Nile URL and workspace ID (we are hoping to make this un-necessary soon)

2. Run the agent: #TODO: server/daemon mode

```
python agent/agent.py
```