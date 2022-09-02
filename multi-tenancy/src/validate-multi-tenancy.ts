import Nile, { CreateEntityRequest } from "@theniledev/js";

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

async function get_instances(
  tenantEmail: string,
  organizationName: string
): Promise<{ [key: string]: string }> {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as tenant ${tenantEmail}`)

  // Login tenant
  await nile.users.loginUser({
    loginInfo: {
      email: tenantEmail,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken
  console.log(colors.green("\u2713"), `Logged into Nile as tenant ${tenantEmail}!\nToken: ` + nile.authToken)

  let orgID;

  // Get orgID
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == organizationName);
  if (maybeTenant) {
    console.log(colors.green("\u2713"), "Org " + tenantEmail + " exists in org id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } else {
    console.log(`Logged in as tenant ${tenantEmail}, cannot find organization with name ${organizationName}`);
    return;
  }

  // List instances of the service
  const instances = (
    await nile.entities.listInstances({
      org: orgID,
      type: NILE_ENTITY_NAME,
    })
  )
    .filter((value: Instance) => value !== null && value !== undefined)
    .reduce((acc, instance: Instance) => {
      acc[instance.id] = instance;
      return acc;
    }, {} as { [key: string]: Instance });
  console.log('Nile Instances: ', instances);

  return Object.keys(instances).filter(
      (key: string) => key !== null && key !== undefined
  );
}

async function add_tenant(
  tenantEmail: string,
  organizationName: string
) {

  console.log("\n--> add_tenant\n");

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}, to configure tenant ${tenantEmail} for organizationName ${organizationName}`);

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
  console.log(colors.green("\u2713"), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken);

  // Get orgID
  let orgID;
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == organizationName);
  if (maybeTenant) {
    console.log(colors.green("\u2713"), "Org " + organizationName + " exists with org id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } else {
    console.error(`Error: organization for tenant ${tenantEmail} should have already been configured`);
    process.exit(1);
  }

  if (!orgID) {
    console.error(`Unable to find or create organization with name ${organizationName}`);
    process.exit(1);
  }
  console.log("orgID is: " + orgID);

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: tenantEmail,
    },
  };
  console.log(`Trying to add tenant ${tenantEmail} to orgID ${orgID}`);
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(colors.green("\u2713"), `Added tenant ${tenantEmail} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(colors.green("\u2713"), `User ${tenantEmail} is already in ${organizationName}`);
      } else {
        console.error(error)
        process.exit(1);
      }
    });

}

function getDifference<T>(a: T[], b: T[]): T[] {
  return a.filter((element) => {
    return !b.includes(element);
  });
}

async function run() {
  // Get instances for NILE_TENANT1_EMAIL
  const instances2a = await get_instances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log("\nBEFORE: \ninstances2a: " + instances2a);

  // Add tenant1 to tenant2's organization
  await add_tenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2b = await get_instances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log("\nAFTER: \ninstances2b: " + instances2b);

  // Get instances for NILE_TENANT2_EMAIL
  const instances2c = await get_instances(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log("\nCompare to tenant2: \ninstances2c: " + instances2c);

  console.log("\ninstances2b: " + instances2b + "\ninstances2c: " + instances2c);
  if (instances2b == undefined || instances2c == undefined) {
    console.error(`Error in setup, need to troubleshoot.`);
    process.exit(1)
  }
  const diff = getDifference(instances2b, instances2c);
  console.log("Diff: " + diff);

  if (diff != "") {
    console.error(`Error: ${NILE_TENANT1_EMAIL} should see the same instances as ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME}2 after being added to that org`);
    process.exit(1)
  }

  // Note: at this time there is no interface to delete a user from an organization.
  // So there is no cleanup to do

}

run();
