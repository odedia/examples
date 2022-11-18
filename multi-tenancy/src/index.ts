import { CreateEntityRequest } from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

var exampleUtils = require('../../utils-module-js/').exampleUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

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
var nile!;

const fs = require('fs');
try {
  const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`))
} catch (err) {
  console.error(err);
  console.error(emoji.get('x'), `Did you check that ../usecases/${NILE_ENTITY_NAME}/entity_definition.json exists?`);
  process.exit(1);
}

const NILE_TENANT_MAX = process.env.NILE_TENANT_MAX || false;

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = EntityDefinition;

// Workflow for the Nile developer
async function setupEntity() {

  // Login
  nile = await exampleUtils.loginAsDev(nile, NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Check if entity exists, create if not
  var myEntities =  await nile.entities.listEntities()
  if (myEntities.find( ws => ws.name==entityDefinition.name)) { 
      console.log(emoji.get('dart'), "Entity " + entityDefinition.name + " exists");
  } else {
      await nile.entities.createEntity({
        createEntityRequest: entityDefinition
      }).then((data) => 
      {
        console.log(emoji.get('white_check_mark'), 'Created entity: ' + JSON.stringify(data, null, 2));
      }).catch((error:any) => console.error(error.message)); 
  }
}

async function addAdmin(admin: string, nile: nileApi) {
  let email = admin.email;
  let password = admin.password;
  let role = admin.role;
  let org = admin.org;

  // user (admin) is org creator
  await exampleUtils.maybeCreateUser(nile, email, password, role);
  nile = await exampleUtils.loginAsUser(nile, email, password);
  let createIfNot = true;
  await exampleUtils.maybeCreateOrg (nile, org, createIfNot);
}

async function addUser(user: string, nile: nileApi, admins: string) {
  let email = user.email;
  let password = user.password;
  let role = user.role;
  let org = user.org;
  let admin = exampleUtils.getAdminForOrg(admins, org);

  // user is not org creator; let admin user create and add the user into the org
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);
  await exampleUtils.maybeCreateUser(nile, email, password, role);
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, org, createIfNot);
  await exampleUtils.maybeAddUserToOrg(nile, email, orgID);
}

async function addEntity(entity: string, nile: nileApi, admins: string) {
  let org = entity.org;
  let admin = exampleUtils.getAdminForOrg(admins, org);

  // Get orgID
  nile = await exampleUtils.loginAsUser(nile, admin.email, admin.password);
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, org, false);

  // Note: this example uses entity_utils.js to programmatically handle any differences
  // in what is required to add a new entity type. This does not necessarily represent
  // what you would do in production
  const { addInstanceToOrg } = require(`../../usecases/${NILE_ENTITY_NAME}/init/entity_utils.js`);
  await addInstanceToOrg(nile, orgID, NILE_ENTITY_NAME, entity);
}

// This function prepopulates data in the Control Plane
// Value is for running the examples and does not represent exactly how this would work in production
async function setupControlPlane() {

  // Login and setup entity
  await setupEntity();

  // Add admins and create their orgs
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  for (let index = 0; index < admins.length ; index++) {
    await addAdmin(admins[index], nile);
  }

  // Add users
  const users = require(`../../usecases/${NILE_ENTITY_NAME}/init/users.json`);
  let limit = NILE_TENANT_MAX ? users.length : 1;
  for (let index = 0; index < limit ; index++) {
    await addUser(users[index], nile, admins);
  }

  // Add entities
  const entities = require(`../../usecases/${NILE_ENTITY_NAME}/init/entities.json`);
  let limit = NILE_TENANT_MAX ? entities.length : 1;
  for (let index = 0; index < limit ; index++) {
    await addEntity(entities[index], nile, admins);
  }

  // List instances
  const admins = require(`../../usecases/${NILE_ENTITY_NAME}/init/admins.json`);
  for (let index = 0; index < admins.length ; index++) {
    let email = admins[index].email;
    let password = admins[index].password;
    nile = await exampleUtils.loginAsUser(nile, email, password);

    let org = admins[index].org;
    let createIfNot = false;
    let orgID = await exampleUtils.maybeCreateOrg (nile, org, createIfNot);

    // List instances
    await nile.entities.listInstances({
      org: orgID,
      type: entityDefinition.name
    }).then((entity_instances) => {
      console.log(`The following entity instances exist in orgID ${orgID}\n`, entity_instances);
    });
  }

}

setupControlPlane();
