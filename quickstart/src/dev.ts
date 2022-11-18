import Nile from "@theniledev/js";

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

let envParams = [
  "NILE_URL",
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
const NILE_DEVELOPER_EMAIL = process.env.NILE_DEVELOPER_EMAIL!;
const NILE_DEVELOPER_PASSWORD = process.env.NILE_DEVELOPER_PASSWORD!;
const nile!;

// Create a new Nile developer account using the values for
// NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD provided in the .env file
async function createDeveloper() {

  // Try to login
  nile = await Nile({
    basePath: NILE_URL,
  }).connect({ email: process.env.NILE_DEVELOPER_EMAIL, password: process.env.NILE_DEVELOPER_PASSWORD });
  if (nile.developers.authToken) {
    console.log(emoji.get('dart'), `Developer ${NILE_DEVELOPER_EMAIL} already exists`);
    process.exit(0);
  }

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
