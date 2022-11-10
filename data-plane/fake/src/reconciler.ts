import Reconcile from './commands/reconcile/index';

import * as dotenv from 'dotenv';

dotenv.config({ override: true });

let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_ENTITY_NAME",
]
envParams.forEach((key: string) => {
  if (!process.env[key]) {
    console.error(`Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const basePath = process.env.NILE_URL!;
const workspace = process.env.NILE_WORKSPACE!;
const entityName = process.env.NILE_ENTITY_NAME!;

async function run() {

  if (!process.env.NILE_WORKSPACE_ACCESS_TOKEN) {
    if (!process.env.NILE_DEVELOPER_EMAIL || !process.env.NILE_DEVELOPER_PASSWORD) {
      console.error(`Error: please provide NILE_WORKSPACE_ACCESS_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env .  See .env.defaults for more info and copy it to .env with your values`);
      process.exit(1);
    } else {
      await Reconcile.run([
        '--basePath', basePath,
        '--workspace', workspace,
        '--email', process.env.NILE_DEVELOPER_EMAIL!,
        '--password', process.env.NILE_DEVELOPER_PASSWORD!,
        '--entity', entityName,
      ]);
    }
  } else {
    await Reconcile.run([
      '--basePath', basePath,
      '--workspace', workspace,
      '--authToken', process.env.NILE_WORKSPACE_ACCESS_TOKEN!,
      '--entity', entityName,
    ]);
  }
}

run();
