import Nile from "@theniledev/js";

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

// Get Nile URL and workspace
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

async function loginDeveloper() {

  if (!process.env.NILE_DEVELOPER_EMAIL || !process.env.NILE_DEVELOPER_PASSWORD) {
    console.error(emoji.get('x'), `Error: please provide NILE_DEVELOPER_EMAIL and NILE_DEVELOPER_PASSWORD in .env .  See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }

  nile = await Nile({
    basePath: NILE_URL,
  });

  await nile.developers.loginDeveloper({
     loginInfo: {
       email: NILE_DEVELOPER_EMAIL,
       password: NILE_DEVELOPER_PASSWORD,
     },
     }).catch((error:any) => {
       console.error(emoji.get('x'), `Error: Failed to login to Nile as developer ${NILE_DEVELOPER_EMAIL}: ` + error.message);
       process.exit(1);
     });

  nile.authToken = nile.developers.authToken;
  if (nile.authToken) {
    console.log("\n" + emoji.get('arrow_right'), ` Logged into Nile as developer`);
  } else {
    console.error(emoji.get('x'), ` Could not log into Nile.  Did you follow the instructions in https://github.com/TheNileDev/examples/blob/main/README.md#setup , and set valid parameter values in a local .env file?`);
    process.exit(1);
  }

}

async function createWorkspace() {

  await loginDeveloper();

  // Check if workspace exists, create if not
  var myWorkspaces = await nile.workspaces.listWorkspaces()
  if ( myWorkspaces.find( ws => ws.name==NILE_WORKSPACE) != null) {
         console.log(emoji.get('dart'), "Workspace " + NILE_WORKSPACE + " exists");
  } else {
      await nile.workspaces.createWorkspace({
        createWorkspaceRequest: { name: NILE_WORKSPACE },
      }).then( (ws) => { if (ws != null)  console.log(emoji.get('white_check_mark'), "Created workspace: " + ws.name)})
        .catch((error:any) => {
          // This could happen because workspaces are globally unique but `listWorkspaces()` shows only the ones belonging to this developer
          if (error.message == "workspace already exists") {
            console.error(emoji.get('x'), `Error: workspace ${NILE_WORKSPACE} already exists (workspace names are globally unique)`);
          } else {
            console.error(error);
            process.exit(1);
          }
        });
  }

}

createWorkspace();
