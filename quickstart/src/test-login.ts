import Nile from "@theniledev/js";

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

async function loginDeveloper() {

  if (!process.env.NILE_WORKSPACE_ACCESS_TOKEN) {
    if (!process.env.NILE_DEVELOPER_EMAIL || !process.env.NILE_DEVELOPER_PASSWORD) {
      console.error(emoji.get('x'), `Error: please provide NILE_WORKSPACE_ACCESS_TOKEN or {NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD} in .env .  See .env.defaults for more info and copy it to .env with your values`);
      process.exit(1);
    }
  }

  console.log(emoji.get('information_source'), ` NILE_WORKSPACE_ACCESS_TOKEN: ${process.env.NILE_WORKSPACE_ACCESS_TOKEN}`);
  console.log(emoji.get('information_source'), ` NILE_DEVELOPER_EMAIL: ${process.env.NILE_DEVELOPER_EMAIL}`);
  console.log(emoji.get('information_source'), ` NILE_DEVELOPER_PASSWORD: ${process.env.NILE_DEVELOPER_PASSWORD}`);

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
  console.log(`token: ${nile.authToken}`);

}

async function testLogin() {

  await loginDeveloper();

}

testLogin();
