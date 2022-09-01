import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

import {iteration_id, NILE_URL, NILE_WORKSPACE} from './constants.ts';
import {NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD} from './constants.ts';
import {NILE_TENANT_EMAIL, NILE_TENANT_PASSWORD, NILE_TENANT_NAME} from './constants.ts';

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});


// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = {
    "name": "dw",
    "schema": {
      "type": "object",
      "properties": {
        "dw_name": { "type": "string" },
        "status": { "type": "string" },
        "ARN": { "type": "string" },
        "Endpoint": { "type": "string" }
      },
      "required": ["dw_name"]
    }
};

var colors = require('colors');

// Workflow for the Nile developer
async function setup_workflow_developer() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`)

  // Signup developer
  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log(`Developer ${NILE_DEVELOPER_EMAIL} already exists`)
    } else {
      console.error(error)
    }
  })

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(`Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(colors.green("\u2713"), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken)

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log("Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createWorkspaceRequest: { name: NILE_WORKSPACE },
      }).then( (ws) => { if (ws != null)  console.log(colors.green("\u2713"), "Created workspace: " + ws.name)})
  }

  // Check if entity exists, create if not
  var myEntities =  await nile.entities.listEntities()
  if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log("Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log(colors.green("\u2713"), 'Created entity: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
  
  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==NILE_TENANT_EMAIL)) {
      console.log("User " + NILE_TENANT_EMAIL + " exists")
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : NILE_TENANT_EMAIL,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {  
      if (usr != null) 
        console.log(colors.green("\u2713"), "Created User: " + usr.email)
    })
  }
}

async function setup_workflow_tenant() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as tenant ${NILE_TENANT_EMAIL}`)

  // Login tenant
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken
  console.log(colors.green("\u2713"), `Logged into Nile as tenant ${NILE_TENANT_EMAIL}!\nToken: ` + nile.authToken)

  var tenant_id;

  // Check if organization exists, create if not
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == NILE_TENANT_NAME)
  if (maybeTenant) {
    console.log("Org " + NILE_TENANT_NAME + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" : 
    {
      name : NILE_TENANT_NAME,
    }}).then ( (org) => {  
      if (org != null) {
        console.log(colors.green("\u2713"), "Created Tenant: " + org.name)
        tenant_id = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

  if (!tenant_id) {
    console.log("Unable to find or create organization. The rest of this example requires a tenant, so you will need to fix the problem before proceeding")
    process.exit(1);
  }

  // Create an instance of the service in the data plane
  await nile.entities.createInstance({
    org : tenant_id,
    type : entityDefinition.name,
    body : {
      dw_name : `DW${iteration_id}`
    }
  }).then((dw) => console.log (colors.green("\u2713"), "Created Data Warehouse: " + JSON.stringify(dw, null, 2)))

  // List instances of the service
  await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name
  }).then((dws) => {
    console.log("The following Data Warehouses exist:")
    console.log(dws)
  })

  // Handle all past events
  console.log("\n\nPrinting past events and on-going ones.")
  console.log('Create or update dws to see more events. Ctrl-c to exit')
  nile.events.on({type: entityDefinition.name, seq: 0},
    async(e) => console.log(JSON.stringify(e, null, 2)))
}

async function run() {

  // Log in as the Nile developer
  await setup_workflow_developer()

  // Log in as the tenant
  await setup_workflow_tenant()
}

run()
