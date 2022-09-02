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

var colors = require('colors');


// Setup one tenant
async function setup_tenant(tenant_email : string, organizationName : string) {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}, to configure tenant ${tenant_email} for organizationName ${organizationName}`)

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

  // Check if tenant exists, create if not
  var myUsers = await nile.users.listUsers()
  if (myUsers.find( usr => usr.email==tenant_email)) {
      console.log("User " + tenant_email + " exists")
  } else {
    await nile.users.createUser({
      createUserRequest : {
        email : tenant_email,
        password : NILE_TENANT_PASSWORD
      }
    }).then ( (usr) => {  
      if (usr != null) 
        console.log(colors.green("\u2713"), "Created User: " + usr.email)
    })
  }

  var tenant_id;

  // Check if organization exists, create if not
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == organizationName)
  if (maybeTenant) {
    console.log("Org " + tenant_email + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    await nile.organizations.createOrganization({"createOrganizationRequest" : 
    {
      name : organizationName,
    }}).then ( (org) => {  
      if (org != null) {
        console.log(colors.green("\u2713"), "Created Tenant: " + org.name)
        tenant_id = org.id
      }
    }).catch((error:any) => console.error(error.message));
  }

  if (!tenant_id) {
    console.error(`Unable to find or create organization with name ${organizationName}`);
    process.exit(1);
  }

  // Add tenant to org
  const body = {
    org: tenant_id,
    addUserToOrgRequest: {
      email: tenant_email,
    },
  };
  console.log(`Trying to add tenant ${tenant_email} to orgID ${tenant_id}`);
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(`Added tenant ${tenant_email} to orgID ${tenant_id}`);
    }).catch((error:any) => {
          if (error.message.startsWith('User is already in org')) {
            console.log(`User ${tenant_email} is already in ${organizationName}`)
          } else {
            console.error(error)
            process.exit(1);
          }
        });

  // List instances of the service
  await nile.entities.listInstances({
    org: tenant_id,
    type: entityDefinition.name
  }).then((dws) => {
    console.log("The following Data Warehouses already exist:")
    console.log(dws)
  })

}


async function setup_multi_tenancy() {

  // Log in as the tenants
  await setup_tenant(NILE_TENANT1_EMAIL, NILE_ORGANIZATION_NAME)
  await setup_tenant(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME}2`)
}

setup_multi_tenancy()
