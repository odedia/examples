import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

import Reconcile from "./commands/reconcile/index"

import * as dotenv from "dotenv";

dotenv.config({ override: true })

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ORGANIZATION_NAME",
  "NILE_ENTITY_NAME",
]
envParams.forEach( (key: string) => {
  if (!process.env[key]) {
    console.error(`Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const NILE_ORGANIZATION_NAME = process.env.NILE_ORGANIZATION_NAME!;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;

// Static
const NILE_TENANT1_EMAIL = "nora@demo.io";
const NILE_TENANT2_EMAIL = 'lisa@demo.io';
const NILE_TENANT_PASSWORD = 'password';

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = {
    "name": NILE_ENTITY_NAME,
    "schema": {
      "type": "object",
      "properties": {
        "greeting": { "type": "string" }
      },
      "required": ["greeting"]
    }
};

var colors = require('colors');

//const getOrgIDFromOrgName = async (
    //orgName: String): Promise< string | null > => {
    //this.log(
      //`Looking up the organization ID from the organization name #${orgName}`
    //);
//
    //// Check if organization exists
    //var myOrgs = await this.nile.organizations.listOrganizations()
    //var maybeOrg = myOrgs.find( org => org.name == orgName)
    //if (maybeOrg) {
      //return maybeOrg.id
    //} else {
      //return null
    //}
//}

// Setup the Control Plane
async function run() {

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
    console.error(`Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(colors.green("\u2713"), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken)

  console.log("NILE_ORGANIZATION_NAME is: " + NILE_ORGANIZATION_NAME);

  var orgID;
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == NILE_ORGANIZATION_NAME)
  if (maybeTenant) {
    console.log("Org " + NILE_ORGANIZATION_NAME + " exists with id " + maybeTenant.id)
    orgID = maybeTenant.id
  } 

  console.log("orgID is: " + orgID);


  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name :" + NILE_ORGANIZATION_NAME)
    process.exit(1);
  } else {
    console.log("Organization with name " + NILE_ORGANIZATION_NAME + " exists with id " + orgID)
  }

  const body = {
     org: orgID,
   };
   nile.authz
     .listRules(body)
     .then((data) => {
       console.log("API called successfully. Returned data: " + data);
     })
     .catch((error: any) => console.error(error));

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==NILE_TENANT1_EMAIL)) {
      console.log("User " + NILE_TENANT1_EMAIL + " exists")
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : NILE_TENANT1_EMAIL,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {
      if (usr != null)
        console.log(colors.green("\u2713"), "Created User: " + usr.email)
    })
  }

  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==NILE_TENANT1_EMAIL)) {
      console.log("User " + NILE_TENANT2_EMAIL + " exists")
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : NILE_TENANT2_EMAIL,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {
      if (usr != null)
        console.log(colors.green("\u2713"), "Created User: " + usr.email)
    })
  }

   const body = {
      org: orgID,
      createRuleRequest: {
        actions: ["deny"],
        resource: {
          type: NILE_ENTITY_NAME,
        },
        subject: { email: NILE_TENANT1_EMAIL },
      },
    };
    console.log(`Creating rule with body ${body}`);
    console.log(JSON.stringify(body, null, 2));
    nile.authz
      .createRule(body)
      .then((data) => {
        console.log("Created rule to deny tenant1 from entity.  Returned data: " + data);
      })
      .catch((error: any) => console.error(error));

   // Above should create a rule that prevents tenant1 from _doing what_?
   // Validate it below.


  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as tenant ${NILE_TENANT1_EMAIL}`)

  // Login tenant
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT1_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken
  console.log(colors.green("\u2713"), `Logged into Nile as tenant ${NILE_TENANT1_EMAIL}!\nToken: ` + nile.authToken)

}

run()
