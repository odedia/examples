import { MetricTypeEnum } from '@theniledev/js';

var exampleUtils = require('../../utils-module-js/').exampleUtils;

var emoji = require('node-emoji');

import * as dotenv from 'dotenv';

dotenv.config({ override: true })

// Get Nile URL and workspace
let envParams = [
  "NILE_URL",
  "NILE_WORKSPACE",
  "NILE_ENTITY_NAME",
]
envParams.forEach( (key: string) => {
  if (!process.env[key]) {
    console.error(emoji.get('x'), `Error: missing environment variable ${ key }. See .env.defaults for more info and copy it to .env with your values`);
    process.exit(1);
  }
});

const NILE_URL = process.env.NILE_URL!;
const NILE_WORKSPACE = process.env.NILE_WORKSPACE!;
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME!;
var nile!;

async function getMetrics() {

  // Login
  nile = await exampleUtils.loginAsDev(nile, NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Get any valid instance ID and its orgID, where entity type is NILE_ENTITY_NAME
  const [oneInstance, orgID] = await exampleUtils.getAnyValidInstance(nile, NILE_ENTITY_NAME);

  // Get measurement for "nile.system.DB.instance.created"
  const metricName = "nile.system.DB.instance.created";
  const metricFilter = {
    metricName: metricName,
    entityType: NILE_ENTITY_NAME,
    organizationId: orgID,
    instanceId: oneInstance,
  };
  await nile.metrics.filterMetricsForEntityType({
    entityType: NILE_ENTITY_NAME,
    filter: metricFilter,
  })
  .then((data) => {
    console.log(emoji.get('white_check_mark'), `Returned metrics for "nile.system.DB.instance.created": ${JSON.stringify(data, null, 2)}`);
  })
  .catch((error: any) => console.error(error));

  // Get measurements for new metric "custom.DB.instance.myMetric"
  const metricName = "custom.DB.instance.myMetric";
  const now = new Date();
  const FOUR_HOURS_AGO = new Date(now.getTime() - 4 * 60 * 60000);
  const metricFilter = {
    metricName: metricName,
    entityType: NILE_ENTITY_NAME,
    organizationId: orgID,
    instanceId: oneInstance,
    startTime: FOUR_HOURS_AGO,
  };
  await nile.metrics.filterMetricsForEntityType({
    entityType: NILE_ENTITY_NAME,
    filter: metricFilter,
  })
  .then((data) => {
    console.log(emoji.get('white_check_mark'), `Returned metrics for "custom.DB.instance.myMetric" (past 4 hours): ${JSON.stringify(data, null, 2)}`);
  })
  .catch((error: any) => console.error(error));

}

getMetrics();
