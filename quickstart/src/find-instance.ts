import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

var emoji = require('node-emoji');

var nileUtils = require('../../utils-module-js/').nileUtils;

import * as dotenv from 'dotenv';

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
const NILE_TENANT_PASSWORD = 'password';

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

async function run() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`)

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(emoji.get('x'), `Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;

  // Get orgID
  let orgID = await nileUtils.getOrgIDFromOrgName (NILE_ORGANIZATION_NAME, nile);
  if (orgID) {
    console.log(emoji.get('white_check_mark'), "Mapped organizationName " + NILE_ORGANIZATION_NAME + " to orgID " + orgID);
  } else {
    console.error(emoji.get('x'), `Cannot find organization with name ${NILE_ORGANIZATION_NAME}`);
    process.exit(1);
  }

  // Find instance with matching name
  var instances = await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME
  })
  if ( instances.find( i => i.properties.greeting.startsWith('Come with me if you want to live')) != null) {
    console.log (emoji.get('white_check_mark'), `Found entity instance ${NILE_ENTITY_NAME}`);
  } else {
    console.error (`Error: could not find entity instance for ${NILE_ENTITY_NAME}`)
    return process.exit(1)
  }

}

run()
