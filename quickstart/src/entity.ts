import Nile, { CreateEntityRequest } from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

// Get Nile URL and workspace
if (!process.env.NILE_URL || !process.env.NILE_WORKSPACE) {
  console.error(emoji.get('x'), `Error: missing variable NILE_URL or NILE_WORKSPACE in .env .  See .env.defaults for more info and copy it to .env with your values`);
  process.exit(1);
}
const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const nile!;

// Get entity schema that defines the service in the data plane
const NILE_ENTITY_NAME = "DB";
const fs = require('fs');
try {
  const EntityDefinition = JSON.parse(fs.readFileSync(`../usecases/${NILE_ENTITY_NAME}/entity_definition.json`))
} catch (err) {
  console.error(err);
  console.error(emoji.get('x'), `Did you check that ../usecases/${NILE_ENTITY_NAME}/entity_definition.json exists?`);
  process.exit(1);
}
const entityDefinition: CreateEntityRequest = EntityDefinition;

async function loginDeveloper() {

  // Login could be via the workspace access token for SSO users or developer email/password
  if (!process.env.NILE_WORKSPACE_ACCESS_TOKEN) {
    if (!process.env.NILE_DEVELOPER_EMAIL || !process.env.NILE_DEVELOPER_PASSWORD) {
      console.error(emoji.get('x'), `Error: please provide NILE_WORKSPACE_ACCESS_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env .  See .env.defaults for more info and copy it to .env with your values`);
      process.exit(1);
    }
  }

  nile = await Nile({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  }).connect(process.env.NILE_WORKSPACE_ACCESS_TOKEN ?? { email: process.env.NILE_DEVELOPER_EMAIL, password: process.env.NILE_DEVELOPER_PASSWORD });

  nile.authToken = nile.developers.authToken;
  if (nile.authToken) {
    console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as developer`);
  } else {
    console.error(emoji.get('x'), ` Could not log into Nile.  Did you follow the instructions in https://github.com/TheNileDev/examples/blob/main/README.md#setup , create your Nile workspace, and set valid parameter values in a local .env file?`);
    process.exit(1);
  }

}

// Workflow for the Nile developer
async function createEntity() {

  await loginDeveloper();

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

createEntity();
