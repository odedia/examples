import Nile, { CreateEntityRequest } from "@theniledev/js";

var emoji = require('node-emoji');

var nileUtils = require('../../utils-module-js/').nileUtils;

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

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
    console.error(emoji.get('x'), `Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const NILE_ORGANIZATION_NAME = process.env.NILE_ORGANIZATION_NAME!;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;

const NILE_TENANT1_EMAIL = 'nora1@demo.io';
const NILE_TENANT2_EMAIL = 'nora2@demo.io';
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

// Setup one tenant
async function setupTenant(userEmail : string, organizationName : string) {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}, to configure tenant ${userEmail} for organizationName ${organizationName}`);

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
  console.log(emoji.get('white_check_mark'), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken);

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==userEmail)) {
      console.log(emoji.get('white_check_mark'), "User " + userEmail + " exists");
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : userEmail,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {  
      if (usr != null) 
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    })
  }

  // Check if organization exists, create if not
  let orgID = await nileUtils.getOrgIDFromOrgName (organizationName, nile);
  if (orgID) {
    console.log(emoji.get('white_check_mark'), "Mapped organizationName " + organizationName + " to orgID " + orgID);
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" : 
    {
      name : organizationName,
    }}).then ( (org) => {  
      if (org != null) {
        console.log(emoji.get('white_check_mark'), "Created organization " + org.name);
        orgID = org.id;
      }
    }).catch((error:any) => console.error(error.message));
  }
  if (!orgID) {
    console.error(emoji.get('x'), `Unable to find or create organization with name ${organizationName}`);
    process.exit(1);
  }

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: userEmail,
    },
  };
  console.log(`Trying to add tenant ${userEmail} to orgID ${orgID}`);
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Added tenant ${userEmail} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(emoji.get('white_check_mark'), `User ${userEmail} is already in ${organizationName}`);
      } else {
        console.error(error)
        process.exit(1);
      }
    });

  // Check if entity instance already exists, create if not
  var myInstances = await nile.entities.listInstances({
        org: orgID,
        type: NILE_ENTITY_NAME,
      })
  var maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME)
  if (maybeInstance) {
    console.log(emoji.get('white_check_mark'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
  } else {
    console.log(myInstances);
    const identifier = Math.floor(Math.random() * 100000)
    await nile.entities.createInstance({
      org: orgID,
      type: NILE_ENTITY_NAME,
      body: {
        greeting : `Come with me if you want to live: ${identifier}`
      }
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME
  }).then((instances) => {
    console.log(`The following entity instances of type ${NILE_ENTITY_NAME} already exist:\n`, instances);
  });
}

async function setupMultiTenancy() {
  // Log in as the tenants
  await setupTenant(NILE_TENANT1_EMAIL, NILE_ORGANIZATION_NAME);
  await setupTenant(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
}

setupMultiTenancy();
