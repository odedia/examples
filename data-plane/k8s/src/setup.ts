import Nile, { CreateEntityRequest } from "@theniledev/js";

const emoji = require('node-emoji');
const fs = require('fs');
const yaml = require('js-yaml');

require('dotenv').config({ override: true })

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ORGANIZATION_NAME"
]
envParams.forEach( (key: string) => {
  if (!process.env[key]) {
    console.error(emoji.get('x'), `Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const NILE_ORGANIZATION_NAME = process.env.NILE_ORGANIZATION_NAME!;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = JSON.parse(fs.readFileSync('./spec/FlinkDeployment.json'))

// Workflow for the Nile developer
async function setup_workflow_developer() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);

  // Signup developer
  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log(`Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    } else {
      console.error(error);
    }
  })

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(emoji.get('x'), `Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(emoji.get('white_check_mark'), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!`);

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log(emoji.get('white_check_mark'), "Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createWorkspaceRequest: { name: NILE_WORKSPACE },
      }).then( (ws) => { if (ws != null)  console.log(emoji.get('white_check_mark'), "Created workspace: " + ws.name)})
        .catch((error:any) => {
          if (error.message == "workspace already exists") {
            console.error(emoji.get('x'), `Error: workspace ${NILE_WORKSPACE} already exists (workspace names are globally unique)`);
            process.exit(1);
          } else {
            console.error(error);
          }
        });
  }

  // Check if entity exists, create if not
  var myEntities =  await nile.entities.listEntities()
  if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log(emoji.get('white_check_mark'), "Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log(emoji.get('white_check_mark'), 'Created entity: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => {
        console.error(emoji.get('x'), "Failed to create " + entityDefinition.name + ": " + error.message);
        process.exit(1);
      }); 
  }

  // Check if organization exists, create if not
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == NILE_ORGANIZATION_NAME);
  var tenant_id! : string;

  if (maybeTenant) {
    console.log(emoji.get('white_check_mark'), "Org " + NILE_ORGANIZATION_NAME + " exists with id " + maybeTenant.id);
    tenant_id = maybeTenant.id;
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" :
    {
      name: NILE_ORGANIZATION_NAME,
    }}).then ( (org) => {
      if (org != null) {
        console.log(emoji.get('white_check_mark'), "Created Tenant: " + org.name);
        tenant_id = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

  // Check if entity instance already exists, create if not
  let myInstances = await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name,
  });
  let maybeInstance = myInstances.find( instance => instance.type == entityDefinition.name);
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), "Entity instance " + entityDefinition.name + " exists with id " + maybeInstance.id);
  } else {
    await nile.entities.createInstance({
      org: tenant_id,
      type: entityDefinition.name,
      body: {
        "spec": {
          "job": {
            "jarURI": "local:///opt/flink/examples/streaming/StateMachineExample.jar",
            "parallelism": 2,
            "upgradeMode": "STATELESS"
          },
          "jobManager": {
            "replicas": 2,
            "resource": {
              "cpu": 1,
              "memory": "2048m"
            }
          },
          "taskManager": {
            "resource": {
              "cpu": 1,
              "memory": "2048m"
            }
          },
          "flinkConfiguration": {
            "taskmanager.numberOfTaskSlots": 2
          }
        },
        "metadata": {
          "name": "basic-example"
        }
      }    
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

  // List instances of the service
  await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name
  }).then((entity_instances) => {
    console.log("The following entity instances exist:");
    console.log(JSON.stringify(entity_instances, null, 2));
  });

  // Download OpenAPI spec
  var strSpec = await nile.entities.getOpenAPI({
    workspace: NILE_WORKSPACE,
    type: entityDefinition.name
  })
  var objSpec = yaml.load(strSpec)
  try {
    delete objSpec.components.schemas.FlinkDeployment.name
    objSpec.components.schemas.FlinkDeployment.type = objSpec.components.schemas.FlinkDeployment.schema.type
    objSpec.components.schemas.FlinkDeployment.properties = objSpec.components.schemas.FlinkDeployment.schema.properties
    delete objSpec.components.schemas.FlinkDeployment.schema
  } catch{
    console.log("Yaml cleanup failed. We'll assume it is because no cleanup is needed")
  }

  fs.writeFileSync('./spec/FlinkDeployment.yaml', yaml.dump(objSpec))

}

async function setup_control_plane() {
  // Log in as the Nile developer
  await setup_workflow_developer();
}

setup_control_plane();
