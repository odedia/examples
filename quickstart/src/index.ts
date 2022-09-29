import Nile, { CreateEntityRequest } from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync('src/models/SaaSDB_Entity_Definition.json'));

var nileUtils = require('../../utils-module-js/').nileUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

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

const NILE_TENANT_MAX = process.env.NILE_TENANT_MAX || false;

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

// Schema for the entity that defines the service in the data plane
const entityDefinition: CreateEntityRequest = EntityDefinition;

// Workflow for the Nile developer
async function setupDeveloper() {

  console.log(`\nSigning up for Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);

  // Signup developer
  await nile.developers.createDeveloper({
    createUserRequest : {
      email : NILE_DEVELOPER_EMAIL,
      password : NILE_DEVELOPER_PASSWORD,
    }
  }).catch((error:any) => {
    if (error.message == "user already exists") {
      console.log(`Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    } else {
      console.error(error);
    }
  })

  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log(emoji.get('dart'), "Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createWorkspaceRequest: { name: NILE_WORKSPACE },
      }).then( (ws) => { if (ws != null)  console.log(emoji.get('white_check_mark'), "Created workspace: " + ws.name)})
        .catch((error:any) => {
          if (error.message == "workspace already exists") {
            console.error(emoji.get('x'), `Error: workspace ${NILE_WORKSPACE} already exists (workspace names are globally unique)`);
            process.exit(1);
          } else {
            console.error(error);
          }
        });
  }

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

async function addInstanceToOrg(email: string, password: string, orgName: string, instanceJson: string) {

  // Get orgID
  await nileUtils.loginAsUser(nile, email, password);
  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, orgName, false);

  // Check if entity instance already exists, create if not
  let myInstances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  });
  let maybeInstance = myInstances.find( instance => instance.type == NILE_ENTITY_NAME && instance.properties.dbName == instanceJson.dbName );
  if (maybeInstance) {
    console.log(emoji.get('dart'), "Entity instance " + NILE_ENTITY_NAME + " exists with id " + maybeInstance.id);
  } else {
    console.log(myInstances);
    await nile.entities.createInstance({
      org: orgID,
      type: entityDefinition.name,
      body: {
        dbName : instanceJson.dbName,
        cloud : instanceJson.cloud,
        environment : instanceJson.environment,
        size : instanceJson.size,
        connection : "server-" + instanceJson.dbName + ":5432",
        status : "Up"
      }
    }).then((entity_instance) => console.log (emoji.get('white_check_mark'), "Created entity instance: " + JSON.stringify(entity_instance, null, 2)))
  }

  // List instances
  await nile.entities.listInstances({
    org: orgID,
    type: entityDefinition.name
  }).then((entity_instances) => {
    console.log(`The following entity instances exist in orgID ${orgID}\n`, entity_instances);
  });
}


async function addTenant(email: string, password: string, orgName: string, role: string) {

  console.log(`\nConfiguring tenant ${email} for orgName ${orgName}`);

  // Create user
  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);
  await nileUtils.maybeCreateUser(nile, email, password, role);

  // Get orgID
  // User will not be able to get orgID if another user/dev created it, so have developer check first
  await nileUtils.loginAsDev(nile, NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD);
  let createIfNot = false;
  let orgID = await nileUtils.maybeCreateOrg (nile, orgName, createIfNot);
  if (!orgID) {
    // Create organization with user
    await nileUtils.loginAsUser(nile, email, password);
    let createIfNot = true;
    orgID = await nileUtils.maybeCreateOrg (nile, orgName, createIfNot);
  }
  await nileUtils.maybeAddUserToOrg(nile, email, orgID);

}

async function setupControlPlane() {

  // Log in as the Nile developer
  await setupDeveloper();

  const usersJson = require('./datasets/userList.json');
  let admins = nileUtils.getAdmins(usersJson);
  let limit = NILE_TENANT_MAX ? usersJson.length : 1;
  for (let index = 0; index < limit ; index++) {
    await addTenant(usersJson[index].email, usersJson[index].password, usersJson[index].org, usersJson[index].role);
  }

  const dbsJson = require('./datasets/dbList.json');
  let limit = NILE_TENANT_MAX ? dbsJson.length : 1;
  for (let index = 0; index < limit ; index++) {
    let adminEmail = usersJson[admins.get(dbsJson[index].org)].email;
    let adminPassword = usersJson[admins.get(dbsJson[index].org)].password;
    await addInstanceToOrg(adminEmail, adminPassword, dbsJson[index].org, dbsJson[index]);
  }

}

setupControlPlane();
