import { NileApi } from '@theniledev/js';
import * as dotenv from 'dotenv';

const emoji = require('node-emoji');

dotenv.config({ override: true });

const exampleUtils = require('../../utils-module-js/').exampleUtils;

// Get Nile URL and workspace
const envParams = ['NILE_URL', 'NILE_WORKSPACE', 'NILE_ENTITY_NAME'];
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
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;
let nile!: NileApi;

async function filterMetrics() {
  // Login
  nile = await exampleUtils.loginAsDev(
    NILE_URL,
    NILE_WORKSPACE,
    process.env.NILE_DEVELOPER_EMAIL,
    process.env.NILE_DEVELOPER_PASSWORD,
    process.env.NILE_WORKSPACE_ACCESS_TOKEN
  );

  // Get any valid instance ID and its orgID, where entity type is NILE_ENTITY_NAME
  const [oneInstance, orgID] = await exampleUtils.getAnyValidInstance(
    nile,
    NILE_ENTITY_NAME
  );

  // Filter measurements for nile.system.${NILE_ENTITY_NAME}.instance.created
  let metricName = `nile.system.${NILE_ENTITY_NAME}.instance.created`;
  let metricFilter = {
    metricName: metricName,
    entityType: NILE_ENTITY_NAME,
    organizationId: orgID,
    instanceId: oneInstance,
  };
  await nile.metrics
    .filterMetricsForEntityType({
      entityType: NILE_ENTITY_NAME,
      filter: metricFilter,
    })
    .then((data) => {
      console.log(
        emoji.get('white_check_mark'),
        `Returned metrics for ${metricName}: ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    })
    .catch((error: any) => console.error(error));

  // Filter measurements for new metric custom.${NILE_ENTITY_NAME}.instance.myMetric, with `startTime` to specify time interval
  metricName = `custom.${NILE_ENTITY_NAME}.instance.myMetric`;
  const now = new Date();
  const FOUR_HOURS_AGO = new Date(now.getTime() - 4 * 60 * 60000);
  metricFilter = {
    metricName: metricName,
    entityType: NILE_ENTITY_NAME,
    organizationId: orgID,
    instanceId: oneInstance,
    startTime: FOUR_HOURS_AGO,
  };
  await nile.metrics
    .filterMetricsForEntityType({
      entityType: NILE_ENTITY_NAME,
      filter: metricFilter,
    })
    .then((data) => {
      console.log(
        emoji.get('white_check_mark'),
        `Returned metrics for ${metricName} (past 4 hours): ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    })
    .catch((error: any) => console.error(error));
}

filterMetrics();
