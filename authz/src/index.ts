import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

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
const NILE_TENANT1_EMAIL = "nora1@demo.io";
const NILE_TENANT2_EMAIL = "nora2@demo.io";
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

async function run() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`)

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

 // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  }).then((dws) => {
    console.log("DEVELOPER: The following instances exist:")
    console.log(dws)
  }).catch((error: any) => console.error(error));

  // Login tenant
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT1_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken
  console.log(colors.green("\u2713"), `Logged into Nile as tenant ${NILE_TENANT1_EMAIL}!\nToken: ` + nile.authToken)


   const body = {
      org: orgID,
      createRuleRequest: {
        actions: "deny",
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
        console.log(`Created rule to deny ${NILE_TENANT1_EMAIL} from entity ${NILE_ENTITY_NAME}.  Returned data: ` + data);
      })
      .catch((error: any) => console.error(error));

  const body = {
     org: orgID,
   };
   nile.authz
     .listRules(body)
      .then((data) => {
        console.log("API called successfully. Returned data: " + data);
        for (let i = 0; i < data.length; i++) {
          const rule = data[i];
          if (rule) {
            console.log(" --> rule: " + JSON.stringify(rule, null, 2));
          }
        };
      })
     .catch((error: any) => console.error(error));


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

  // Create an instance of the service in the data plane
  await nile.entities.createInstance({
    org : orgID,
    type : NILE_ENTITY_NAME,
    body : {
      greeting : `Test greeting 4`
    }
  }).then((dw) => console.log (colors.green("\u2713"), `${NILE_TENANT1_EMAIL} was able to create an entity instance of ${NILE_ENTITY_NAME}:` + JSON.stringify(dw, null, 2)))

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  }).then((dws) => {
    console.log("TENANT: The following instances exist:")
    console.log(dws)
  }).catch((error: any) => console.error(error));


}

run()
