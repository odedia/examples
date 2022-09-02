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

async function run() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`)

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
  }).catch((error:any) => {
    console.error(`Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
    process.exit(1);
  });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;

  // Find tenant id
  var tenant_id;
  var myOrgs = await nile.organizations.listOrganizations()
  var maybeTenant = myOrgs.find( org => org.name == NILE_ORGANIZATION_NAME)
  if (maybeTenant) {
    console.log(colors.green("\u2713"), "Org " + NILE_ORGANIZATION_NAME + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    console.error("Cannot find org id for " + NILE_ORGANIZATION_NAME)
  }

  // Find instance with matching name
  var instances = await nile.entities.listInstances({
    org: tenant_id,
    type: NILE_ENTITY_NAME
  })
  if ( instances.find( i => i.properties.greeting.startsWith('Come with me if you want to live')) != null) {
    console.log (colors.green("\u2713"), `Found Data Warehouse entry`)
  } else {
    console.error (`Error: could not find Data Warehouse entity instance`)
    return process.exit(1)
  }

}

run()
