import Nile from "@theniledev/js";

var exampleUtils = require('../../utils-module-js/').exampleUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
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
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;
const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`));

async function getInstances(
  tenantEmail: string,
  orgName: string
): Promise<{ [key: string]: string }> {

  // Login tenant
  nile = await exampleUtils.loginAsUser(nile, tenantEmail, "password");

  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    return [];
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
  //console.log('Nile Instances: ', instances);

  return Object.keys(instances).filter(
      (key: string) => key !== null && key !== undefined
  );
}

async function addTenant(
  tenantEmail: string,
  orgName: string
) {

  // Login
  nile = await exampleUtils.loginAsDev(NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Get orgID
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    console.error(emoji.get('x'), `Error: organization ${orgName} for tenant ${tenantEmail} should have already been configured`);
    process.exit(1);
  }
  //console.log("orgID is: " + orgID);

  // Add user to organization
  await exampleUtils.maybeAddUserToOrg(nile, tenantEmail, orgID);

  await listUsersInOrg(orgName, tenantEmail, true);

}


async function listUsersInOrg(orgName: string, userToValidate: string, expectedPresent: boolean) {

  nile = await exampleUtils.loginAsDev(NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Get orgID
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    console.error(emoji.get('x'), `Error: organization ${orgName} should already exist`);
    process.exit(1);
  }

  var userFound = false;
  console.log(`Users found in org ${orgName} (${orgID}): `);
  const body = {
    org: orgID,
  };
  var users = await nile.organizations.listUsersInOrg(body);
  for (let i=0; i < users.length; i++) {
    console.log(`${JSON.stringify(users[i].email, null, 2)}`);
    if (userToValidate !== undefined && users[i].email === userToValidate) {
      userFound = true;
    }
  }

  // Check presence of user
  if (userToValidate !== undefined && expectedPresent !== undefined) {
    if (userFound && expectedPresent === true) {
      console.log(emoji.get('white_check_mark'), `Expected and found ${userToValidate} in ${orgName}`);
    } else if (!userFound && expectedPresent === false) {
      console.log(emoji.get('white_check_mark'), `Did not expect and did not find ${userToValidate} in ${orgName}`);
    } else if (userFound && expectedPresent === false) {
      console.error(emoji.get('x'), `Did not expect but found ${userToValidate} in ${orgName}`);
    } else {
      console.error(emoji.get('x'), `Expected but did not find ${userToValidate} in ${orgName}`);
      process.exit(1);
    }
  }
}


async function removeTenant(
  tenantEmail: string,
  orgName: string
) {

  // Login tenant
  await exampleUtils.loginAsUser(nile, tenantEmail, "password");

  // get user ID
  var userID;
  await nile.users
    .me()
    .then((data) => {
       userID = data.id;
    })
    .catch((error: any) => console.error(error));

  // get organization ID
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, orgName, false);
  if (!orgID) {
    console.error(emoji.get('x'), `Error: organization ${orgName} for tenant ${tenantEmail} should exist`);
    process.exit(1);
  }

  // Remove the user from the organization
  const body = {
    org: orgID,
    user: userID,
  };
  await nile.organizations
    .removeUserFromOrg(body)
    .then(() => {
      console.log(emoji.get('white_check_mark'), `Removed user ${tenantEmail} (${userID}) from org ${orgID}`);
    })
    .catch((error:any) => console.error(error));

  // Delete the user from the workspace
  /*
  await nile.users
    .deleteUser({
       id: userID,
      })
    .then(() => {
      console.log(emoji.get('white_check_mark'), `Deleted user ${tenantEmail} (${userID}) from the workspace`);
    })
    .catch((error: any) => console.error(error));
  */

  await listUsersInOrg(orgName, tenantEmail, false);

}


function getDifference<T>(a: T[], b: T[]): T[] {
  return a.filter((element) => {
    return !b.includes(element);
  });
}


async function run() {

  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);

  const NILE_ORGANIZATION_NAME1 = admins[0].org;
  console.log("\n", emoji.get('small_red_triangle_down'), `Initial state in ${NILE_ORGANIZATION_NAME1}`);
  await listUsersInOrg(NILE_ORGANIZATION_NAME1);

  const NILE_TENANT1_EMAIL = "newuser1@demo.io";
  const NILE_TENANT_PASSWORD = "password";
  console.log("\n", emoji.get('small_red_triangle_down'), `Add ${NILE_TENANT1_EMAIL} to ${NILE_ORGANIZATION_NAME1}`);
  await exampleUtils.maybeCreateUser(nile, NILE_TENANT1_EMAIL, NILE_TENANT_PASSWORD, "RO");
  await addTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME1}`);

  const NILE_ORGANIZATION_NAME2 = admins[1].org;
  console.log("\n", emoji.get('small_red_triangle_down'), `Initial state in ${NILE_ORGANIZATION_NAME2}`);
  await listUsersInOrg(NILE_ORGANIZATION_NAME2);

  const NILE_TENANT2_EMAIL = "newuser2@demo.io";
  console.log("\n", emoji.get('small_red_triangle_down'), `Add ${NILE_TENANT2_EMAIL} to ${NILE_ORGANIZATION_NAME2}`);
  await exampleUtils.maybeCreateUser(nile, NILE_TENANT2_EMAIL, NILE_TENANT_PASSWORD, "RO");
  await addTenant(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2a = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  console.log("\n", emoji.get('small_red_triangle_down'), `Add ${NILE_TENANT1_EMAIL} to ${NILE_ORGANIZATION_NAME2}`);
  await addTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2b = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT2_EMAIL
  const instances2c = await getInstances(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  console.log("\n", emoji.get('small_red_triangle_down'), `Results`);
  console.log(`-->BEFORE ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME2} could read:   ${instances2a}`);
  console.log(`-->AFTER  ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME2} can now read: ${instances2b}`);
  console.log(`-->Compare ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME2} can read:    ${instances2c}`, "\n");

  if (instances2b == undefined || instances2c == undefined) {
    console.error(emoji.get('x'), `Error in setup, need to troubleshoot.`);
    process.exit(1)
  }
  const diff = getDifference(instances2b, instances2c);
  if (diff != "") {
    console.error(emoji.get('x'), `Error: ${NILE_TENANT1_EMAIL} should see the same instances as ${NILE_TENANT2_EMAIL} in ${NILE_ORGANIZATION_NAME2} after being added to that org`);
    console.log("Diff: " + diff);
    process.exit(1)
  } else {
    console.log(emoji.get('white_check_mark'), `No difference between instances seen by ${NILE_TENANT1_EMAIL} and ${NILE_TENANT2_EMAIL}`);
  }

  // Remove tenant from orgs
  console.log("\n", emoji.get('small_red_triangle_down'), `Remove ${NILE_TENANT1_EMAIL} and ${NILE_TENANT2_EMAIL} from the orgs`);
  await removeTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME1}`);
  await removeTenant(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);
  await removeTenant(NILE_TENANT2_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  // Get instances for NILE_TENANT1_EMAIL
  const instances2d = await getInstances(NILE_TENANT1_EMAIL, `${NILE_ORGANIZATION_NAME2}`);

  console.log("\n", emoji.get('small_red_triangle_down'), `Final test for ${NILE_TENANT1_EMAIL}`);
  console.log(`-->AFTER REMOVAL ${NILE_TENANT1_EMAIL} in ${NILE_ORGANIZATION_NAME2} can now read: ${instances2d}`);

}

run();
