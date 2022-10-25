import Nile from "@theniledev/js";

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
const nile!;

// Workflow for the Nile developer
async function createDeveloper() {

  nile = await Nile({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  });

  // Signup developer
  try {
    await nile.developers.createDeveloper({
      createUserRequest : {
        email : NILE_DEVELOPER_EMAIL,
        password : NILE_DEVELOPER_PASSWORD,
      }
    })
    console.log(emoji.get('white_check_mark'), `Signed up for Nile at ${NILE_URL} as developer ${NILE_DEVELOPER_EMAIL}`);
  } catch (error:any) {
    if (error.message == "user already exists") {
      console.log(emoji.get('dart'), `Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    } else {
      console.error(error);
      process.exit(1);
    }
  };

}

createDeveloper();
