import Nile from '@theniledev/js';

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync('../quickstart/src/models/SaaSDB_Entity_Definition.json'));

var nileUtils = require('../../utils-module-js/').nileUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
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
const NILE_ENTITY_NAME = EntityDefinition.name;

const usersJson = require('../../quickstart/src/datasets/userList.json');
// Load first user only
const index=0
const email = usersJson[index].email;
const NILE_TENANT_PASSWORD = usersJson[index].password;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});


async function listPolicies(orgID : string) {
  // List policies
  const body = {
    org: orgID,
  };
  await nile.access
    .listPolicies(body)
    .then((data) => {
      console.log(`List of policies for ${orgID}:\n`, data);
    })
    .catch((error: any) => console.error(error));
}

async function createAccessPolicyEntityInstance(email: string, orgID: string, dbName: string, actions: string[]) {

  // Find instance
  var instance_id;
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties.dbName == dbName );
  if (maybeInstance) {
    console.log(emoji.get('dart'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
    instance_id = maybeInstance.id;
  } else {
    console.error(emoji.get('x'), `Error: cannot find instance of type ${NILE_ENTITY_NAME} where dbName is ${dbName}`);
    process.exit(1);
  }

  // Create policy
  var policyID;
  const body = {
    org: orgID,
    createPolicyRequest: {
      actions: actions,
      resource: {
        type: NILE_ENTITY_NAME,
        id: instance_id
      },
      subject: { email : email },
    },
  };
  console.log("Creating policy with body: " + JSON.stringify(body, null, 2));
  await nile.access
    .createPolicy(body)
    .then((data) => {
      policyID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(emoji.get('white_check_mark'), `Created policy with id ${policyID} for subject ${email} for entity ${NILE_ENTITY_NAME}`);
    })
    .catch((error: any) => console.error(error));

}

async function createAccessPolicyForPolicies(email: string, orgID: string) {

  // Create policy
  var policyID;
  const body = {
    org: orgID,
    createPolicyRequest: {
      actions: ["read", "write"],
      resource: {
        type: "policy"
      },
      subject: { email : email },
    },
  };
  console.log("Creating policy with body: " + JSON.stringify(body, null, 2));
  await nile.access
    .createPolicy(body)
    .then((data) => {
      policyID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(emoji.get('white_check_mark'), `Created policy with id ${policyID} for subject ${email} for policies`);
    })
    .catch((error: any) => console.error(error));

}

async function run() {

  // For ease of demo: the Nile developer creates all the access policies
  // However, in practice, the organization's admin user can create the necessary policies
  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  var actions;
  const dbsJson = require('../../quickstart/src/datasets/dbList.json');
  const usersJson = require('../../quickstart/src/datasets/userList.json');
  for (let index = 0 ; index < dbsJson.length ; index++) {

    let pageOrg = dbsJson[index].org;
    let createIfNot = false;
    let orgID = await nileUtils.maybeCreateOrg (nile, pageOrg, createIfNot);
    if (!orgID) {
      console.error ("Error: cannot determine the ID of the organization from the provided name :" + orgName)
      process.exit(1);
    }

    for (let index2 = 0 ; index2 < usersJson.length ; index2++) {
      if (usersJson[index2].org == pageOrg) {
        if (usersJson[index2].role == "admin") {
          // In this scenario, admins have RW for policies and entity instances
          await createAccessPolicyForPolicies(usersJson[index2].email, orgID);
          actions = ["read", "write"];
        } else if (usersJson[index2].role == "RW") {
          actions = ["read", "write"];
        } else if (usersJson[index2].role == "RO") {
          actions = ["read"];
        } else {
          actions = ["deny"];
        }
        await createAccessPolicyEntityInstance(usersJson[index2].email, orgID, dbsJson[index].dbName, actions);

      }
    }

    // List policies
    await listPolicies(orgID);
  }
}

run();
