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

// Set entity
const NILE_ENTITY_NAME = "DB";

async function setupUser() {

  // Set Nile
  nile = Nile({
    basePath: NILE_URL,
    workspace: NILE_WORKSPACE,
  });

  // Check if user exists, create if not
  let email = "shaun@colton.demo"
  let password = "password"
  try {
    await nile.users.loginUser({
      loginInfo: {
        email: email,
        password: password,
      },
      });
    console.log(emoji.get('dart'), "User with email " + email + " already exists");
  } catch {
    await nile.users.createUser({
      createUserRequest : {
        email : email,
        password : password,
      }
    }).then ( (usr) => {
      if (usr != null)
        console.log(emoji.get('white_check_mark'), "Created User: " + usr.email);
    }).catch((error:any) => {
      console.error(error);
      process.exit(1);
    })
  }
}

setupUser();
