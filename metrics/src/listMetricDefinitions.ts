import { NileApi } from '@theniledev/js';
import * as dotenv from 'dotenv';

const emoji = require('node-emoji');

dotenv.config({ override: true });

const exampleUtils = require('../../utils-module-js/').exampleUtils;

// Get Nile URL and workspace
const envParams = ['NILE_URL', 'NILE_WORKSPACE'];
envParams.forEach((key: string) => {
  if (!process.env[key]) {
    console.error(
      emoji.get('x'),
      `Error: missing environment variable ${key}. See .env.defaults for more info and copy it to .env with your values`
    );
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
let nile!: NileApi;

async function listMetricDefinitions() {
  // Login
  nile = await exampleUtils.loginAsDev(
    NILE_URL,
    NILE_WORKSPACE,
    process.env.NILE_DEVELOPER_EMAIL,
    process.env.NILE_DEVELOPER_PASSWORD,
    process.env.NILE_WORKSPACE_ACCESS_TOKEN
  );

  // List available metrics
  await nile.metrics
    .listMetricDefinitions()
    .then((data) => {
      console.log(
        emoji.get('white_check_mark'),
        `Available metric definitions: ${JSON.stringify(data, null, 2)}`
      );
    })
    .catch((error: any) => {
      console.error(
        emoji.get('x'),
        `Error: cannot list metric definitions: ${error}`
      );
      process.exit(1);
    });
}

listMetricDefinitions();
