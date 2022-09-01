import Nile, { CreateEntityRequest, Entity, Organization} from "@theniledev/js";
import { CreateEntityOperationRequest } from "@theniledev/js/dist/generated/openapi/src";

import {iteration_id, NILE_URL, NILE_WORKSPACE} from './constants.ts';
import {NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD} from './constants.ts';
import {NILE_TENANT_NAME} from './constants.ts';

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
  var maybeTenant = myOrgs.find( org => org.name == NILE_TENANT_NAME)
  if (maybeTenant) {
    console.log("Org " + NILE_TENANT_NAME + " exists with id " + maybeTenant.id)
    tenant_id = maybeTenant.id
  } else {
    console.error("Cannot find id for " + NILE_TENANT_NAME)
  }

  // Find instance with matching name
  var instances = await nile.entities.listInstances({
    org: tenant_id,
    type: "dw"
  })
  if ( instances.find( i => i.properties.dw_name == `DW${iteration_id}`) != null) {
    console.log (`Found Data Warehouse entry with name DW${iteration_id}`)
  } else {
    console.error (`Error: could not find Data Warehouse entity instance with dw_name DW${iteration_id}`)
    return process.exit(1)
  }

}

run()
