import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

const iteration_id = "11" // to allow running this script repeatedly


const NILE_URL = "https://prod.thenile.dev"
const NILE_WORKSPACE = "clustify" + iteration_id
const NILE_DEVELOPER_EMAIL = `chris${iteration_id}@clustify.com`
const NILE_DEVELOPER_PASSWORD = "foobar"

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

const entityDefinition: CreateEntityRequest = {
    "name": "clusters",
    "schema": {
      "type": "object",
      "properties": {
        "cluster_name": { "type": "string" },
        "status": { "type": "string" },
        "ARN": { "type": "string" },
        "Endpoint": { "type": "string" }
      },
      "required": ["cluster_name"]
    }
  };

async function quickstart() {

  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log("Developer already exists")
    } else {
      console.error(error)
    }
  })

  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error("Failed to login to Nile as developer: " + error.message);
    process.exit(1);
  });

  nile.authToken = nile.developers.authToken;
  console.log("Successfully logged into nile! " + nile.authToken)

  // check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log("Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createOrganizationRequest: { name: NILE_WORKSPACE}, 
      }).then( (ws) => { if (ws != null)  console.log("Successfully created Workspace: " + ws.name)})
  }

  // check if entity exists, create if not
 var myEntities =  await nile.entities.listEntities()
 if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log("Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
  
  const NILE_TENANT_EMAIL=`nora${iteration_id}@rocketslides.org`
  const NILE_TENANT_PASSWORD="mycatname"
    
  // check if user exists, create if not
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
        console.log("User " + usr.email + " was created")
    })
  }

  // Log in as Shaun. The rest of the work will be done from Shaun's POV as a user of Clustify
  
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken


  const NILE_TENANT_NAME = "RocketSlides" + iteration_id
  var tenant_id;

  // check if org exists, create if not
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
        console.log("Tenant " + org.name + " was created")
        tenant_id = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

if (!tenant_id) {
  console.log("Unable to find or create organization. The rest of this example requires a tenant, so you will need to fix the problem before proceeding")
  process.exit(1);
}

  // create cluster
  await nile.entities.createInstance({
    org : tenant_id,
    type : entityDefinition.name,
    body : {
      cluster_name : "MyFirstCluster"
    }
  }).then((cluster) => console.log ("cluster was created: " + JSON.stringify(cluster, null, 2)))

  // list clusters
  await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name
  }).then((clusters) => {
    console.log("You have the following clusters:")
    console.log(clusters)
  })

// handle all past events
console.log('Printing past events and on-going ones.')
console.log('Create or update clusters to see more events. Ctrl-c to exit')
nile.events.on({type: entityDefinition.name, seq: 0},
  async(e) => console.log(JSON.stringify(e, null, 2)))
}

quickstart()

