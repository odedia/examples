import Nile from "@theniledev/js";

var emoji = require('node-emoji');

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

const NILE_TENANT1_EMAIL = 'nora@demo.io';
const NILE_TENANT2_EMAIL = 'frank@demo.io';
const NILE_TENANT_PASSWORD = 'password';

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

async function getInstances(
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
  console.log(emoji.get('white_check_mark'), `Logged into Nile as tenant ${tenantEmail}!`)

  let orgID = await getOrgIDFromOrgName (organizationName);
  if (orgID) {
    console.log(emoji.get('white_check_mark'), "Org " + organizationName + " exists in org id " + orgID);
  } else {
    console.log(`Logged in as tenant ${tenantEmail}, cannot find organization with name ${organizationName}`);
    return;
  }
  console.log(emoji.get('white_check_mark'), "Mapped organizationName " + organizationName + " to orgID " + orgID);

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
  //console.log('Nile Instances: ', instances);

  return Object.keys(instances).filter(
      (key: string) => key !== null && key !== undefined
  );
}

async function addTenant(
  tenantEmail: string,
  organizationName: string
) {

  console.log(`Logging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}, to add ${tenantEmail} to ${organizationName}`);

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

  // Get orgID
  let orgID = await getOrgIDFromOrgName (organizationName);
  if (orgID) {
    console.log(emoji.get('white_check_mark'), "Org " + organizationName + " exists in org id " + orgID);
  } else {
    console.error(emoji.get('x'), `Error: organization ${organizationName} for tenant ${tenantEmail} should have already been configured`);
    process.exit(1);
  }
  //console.log("orgID is: " + orgID);

  // Add user to organization
  const body = {
    org: orgID,
    addUserToOrgRequest: {
      email: tenantEmail,
    },
  };
  nile.organizations
    .addUserToOrg(body)
    .then((data) => {
      console.log(emoji.get('white_check_mark'), `Added tenant ${tenantEmail} to orgID ${orgID}`);
    }).catch((error:any) => {
      if (error.message.startsWith('User is already in org')) {
        console.log(emoji.get('white_check_mark'), `User ${tenantEmail} is already in ${organizationName}`);
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

async function getOrgIDFromOrgName(
  orgName: String): Promise< string | null > {

  // Check if organization exists
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeOrg = myOrgs.find( org => org.name == orgName)
  if (maybeOrg) {
    return maybeOrg.id
  } else {
    return null
  }
}

async function run() {
  // Get instances for NILE_TENANT1_EMAIL
  const instances2a = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log(`\n-->BEFORE instances: ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME}2: ${instances2a}`);

  // Add tenant1 to tenant2's organization
  console.log(`\nAdding ${NILE_TENANT1_EMAIL} to ${NILE_ORGANIZATION_NAME}2\n`);
  await addTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2b = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log(`\n-->AFTER instances: ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME}2: ${instances2b}`);

  // Get instances for NILE_TENANT2_EMAIL
  const instances2c = await getInstances(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME}2`);
  console.log(`\n-->Compare to instances: ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME}2: ${instances2c}`);

  if (instances2b == undefined || instances2c == undefined) {
    console.error(emoji.get('x'), `Error in setup, need to troubleshoot.`);
    process.exit(1)
  }
  const diff = getDifference(instances2b, instances2c);
  if (diff != "") {
    console.error(emoji.get('x'), `Error: ${NILE_TENANT1_EMAIL} should see the same instances as ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME}2 after being added to that org`);
    console.log("Diff: " + diff);
    process.exit(1)
  } else {
    console.log(emoji.get('white_check_mark'), `No difference between instances seen by ${NILE_TENANT1_EMAIL} and ${NILE_TENANT2_EMAIL}`);
  }

  // Note: at this time there is no interface to delete a user from an organization

}

run();
