import Reconcile from './commands/reconcile/index';

const fs = require('fs');
const EntityDefinition = JSON.parse(fs.readFileSync('./../../quickstart/src/models/SaaSDB_Entity_Definition.json'));

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_DEVELOPER_EMAIL",
  "NILE_DEVELOPER_PASSWORD",
  "NILE_ORGANIZATION_NAME",
]
envParams.forEach((key: string) => {
  if (!process.env[key]) {
    console.error(`Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const basePath = process.env.NILE_URL!;
const workspace = process.env.NILE_WORKSPACE!;
const email = process.env.NILE_DEVELOPER_EMAIL!;
const password = process.env.NILE_DEVELOPER_PASSWORD!;
const organizationName = process.env.NILE_ORGANIZATION_NAME!;
const NILE_ENTITY_NAME = EntityDefinition.name;

async function run() {
  await Reconcile.run([
    '--basePath', basePath,
    '--workspace', workspace,
    '--email', email,
    '--password', password,
    '--organizationName', organizationName,
    '--entity', NILE_ENTITY_NAME
  ]);
}

run();
