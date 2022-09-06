import Nile from '@theniledev/js';

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

// Static
const NILE_TENANT1_EMAIL = 'nora1@demo.io';
const NILE_TENANT2_EMAIL = 'nora2@demo.io';
const NILE_TENANT_PASSWORD = 'password';

const nile = Nile({
  basePath: NILE_URL,
  workspace: NILE_WORKSPACE,
});

var colors = require('colors');

async function testTenant(orgID : string, expectEmpty : boolean = false) {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as tenant ${NILE_TENANT1_EMAIL}`);

  // Login tenant
  await nile.users.loginUser({
    loginInfo: {
      email: NILE_TENANT1_EMAIL,
      password: NILE_TENANT_PASSWORD
    }
  })

  nile.authToken = nile.users.authToken
  console.log(colors.green("\u2713"), `--> Logged into Nile as tenant ${NILE_TENANT1_EMAIL}!\nToken: ` + nile.authToken);

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
  }).then((instances) => {
    console.log("\n--> TENANT: list of allowed instances:", instances);
    if (expectEmpty && instances.length != 0) {
      console.error(`Error: Tenant should not see ${NILE_ENTITY_NAME} instances`);
      process.exit(1);
    }
  }).catch((error: any) => console.error(error));

}

async function listRules(orgID : string) {
  // List rules
  const body = {
    org: orgID,
  };
  await nile.authz
    .listRules(body)
    .then((data) => {
      console.log('Listed rules: ', data);
    })
    .catch((error: any) => console.error(error));
}



async function run() {

  console.log(`\nLogging into Nile at ${NILE_URL}, workspace ${NILE_WORKSPACE}, as developer ${NILE_DEVELOPER_EMAIL}`);

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

  console.log(`NILE_ORGANIZATION_NAME is ${NILE_ORGANIZATION_NAME}`);

  var orgID;
  var myOrgs = await nile.organizations.listOrganizations();
  var maybeTenant = myOrgs.find( org => org.name == NILE_ORGANIZATION_NAME);
  if (maybeTenant) {
    console.log("Org " + NILE_ORGANIZATION_NAME + " exists with id " + maybeTenant.id);
    orgID = maybeTenant.id;
  } 

  console.log(`orgID is ${orgID}`);

  if (!orgID) {
    console.error ("Error: cannot determine the ID of the organization from the provided name :" + NILE_ORGANIZATION_NAME)
    process.exit(1);
  } else {
    console.log('Organization with name ' + NILE_ORGANIZATION_NAME + ' exists with id ' + orgID);
  }

  // List rules
  listRules(orgID);

  // List instances of the service
  await nile.entities.listInstances({
    org: orgID,
    type: NILE_ENTITY_NAME,
    }).then((instances) => {
      console.log('DEVELOPER: list of allowed instances:', instances);
    })
    .catch((error: any) => console.error(error));

  console.log('Test tenant before');
  await testTenant(orgID, false);

  // Login developer
  await nile.developers.loginDeveloper({
    loginInfo: {
      email: NILE_DEVELOPER_EMAIL,
      password: NILE_DEVELOPER_PASSWORD,
    },
    })
    .catch((error:any) => {
      console.error(`Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
      process.exit(1);
    });

  // Get the JWT token
  nile.authToken = nile.developers.authToken;
  console.log(colors.green("\u2713"), `Logged into Nile as developer ${NILE_DEVELOPER_EMAIL}!\nToken: ` + nile.authToken);

  // Create rule
  var ruleID;
  const body = {
    org: orgID,
    createRuleRequest: {
      actions: ["deny"],
      resource: {
        type: NILE_ENTITY_NAME,
        //id: <instance id>,
      },
      subject: { email : NILE_TENANT1_EMAIL },
    },
  };
  console.log("Creating rule with body: " + JSON.stringify(body, null, 2));
  await nile.authz
    .createRule(body)
    .then((data) => {
      ruleID = JSON.stringify(data.id, null, 2).replace(/['"]+/g, '');
      console.log(`Created rule with id ${ruleID} to deny ${NILE_TENANT1_EMAIL} from entity ${NILE_ENTITY_NAME}.  Returned data: ` + JSON.stringify(data, null, 2));
    })
    .catch((error: any) => console.error(error));

  // List rules
  listRules(orgID);

  console.log('Test tenant after');
  await testTenant(orgID, true);

  // Delete rule
  const body = {
    org: orgID,
    ruleId: ruleID,
  };
  console.log("\nDeleting rule with body: " + JSON.stringify(body, null, 2));
  await nile.authz
    .deleteRule(body)
    .then((data) => {
      console.log(`Deleted rule with id ${ruleID}`);
    })
    .catch((error: any) => console.error(error));

  // List rules
  listRules(orgID);

  console.log('Test tenant after');
  await testTenant(orgID, false);
}

run();
