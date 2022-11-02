import Nile, { NileApi, Measurement, Metric, MetricTypeEnum } from '@theniledev/js';

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

async function produceMetrics() {

  // Login
  nile = await exampleUtils.loginAsDev(nile, NILE_URL, NILE_WORKSPACE, process.env.NILE_DEVELOPER_EMAIL, process.env.NILE_DEVELOPER_PASSWORD, process.env.NILE_WORKSPACE_ACCESS_TOKEN);

  // Get first org ID
  const users = require(`../../usecases/${NILE_ENTITY_NAME}/init/users.json`);
  // Load first user only
  const index=0
  const NILE_ORGANIZATION_NAME = users[index].org;
  let createIfNot = false;
  let orgID = await exampleUtils.maybeCreateOrg (nile, NILE_ORGANIZATION_NAME, false);

  // Get one instance ID for above org ID
  var oneInstance;
  await nile.entities.listInstances({
      type: NILE_ENTITY_NAME,
      org: orgID,
    }).then((data) => {
      for (let i=0; i < data.length; i++) {
        console.log(`${data[i].id}`);
        oneInstance = data[i].id;
      }
    });

  // Produce one metric
  const now = new Date();
  const metricName = "myMetric";
  const intervalTimeMs = 2000;
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
  console.log(`\n\nSending metric:\n[${JSON.stringify(metricData, null, 2)}]`);
  await nile.metrics.produceBatchOfMetrics({
    metric: [metricData],
  });

}

produceMetrics();
