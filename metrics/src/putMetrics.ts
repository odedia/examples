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

async function putMetrics() {

  // Login
  nile = await exampleUtils.loginAsDev(nile, NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Get any valid instance ID and its orgID, where entity type is NILE_ENTITY_NAME
  const [oneInstance, orgID] = await exampleUtils.getAnyValidInstance(nile, NILE_ENTITY_NAME);

  // Produce one metric
  const now = new Date();
  const metricName = "myMetric";
  const fakeMeasurement = {
    timestamp: now,
    value: 11.8,
    instanceId: oneInstance,
  };

  const metricData = {
    name: metricName,
    type: MetricTypeEnum.Gauge,
    entityType: NILE_ENTITY_NAME,
    measurements: [fakeMeasurement],
  };
  await nile.metrics.produceBatchOfMetrics({
    metric: [metricData],
  })
    .catch((error: any) => {
      console.error(emoji.get('x'), `Error: cannot produce measurement: ${error}`);
      process.exit(1);
    });
  console.log(emoji.get('white_check_mark'), `Produced one measurement:\n[${JSON.stringify(metricData, null, 2)}]`);

}

putMetrics();
