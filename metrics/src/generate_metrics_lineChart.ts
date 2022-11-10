import { MetricTypeEnum, NileApi } from '@theniledev/js';

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

async function putMetrics() {
  // Login
  nile = await exampleUtils.loginAsDev(
    nile,
    NILE_URL,
    NILE_WORKSPACE,
    process.env.NILE_DEVELOPER_EMAIL,
    process.env.NILE_DEVELOPER_PASSWORD,
    process.env.NILE_WORKSPACE_ACCESS_TOKEN
  );

  // Produce metrics for the lineChart
  const FOUR_SECONDS = 4 * 1000;
  const { lineChart } = require(`../../webapp/metrics/${NILE_ENTITY_NAME}/index.ts`);
  const METRIC_NAME = lineChart['metricName'];

  // Execute first time without delay
  await execute(METRIC_NAME);

  // Loop
  var interval = setInterval(async function() {
      await execute(METRIC_NAME);
    }, FOUR_SECONDS);
}

async function execute(metricName: string) {

  var instances = await nile.entities.listInstancesInWorkspace({
      type: NILE_ENTITY_NAME,
    });

  let measurements = [];
  for (let i=0; i < instances.length; i++) {
    let status = instances[i].properties.status;
    if (status === undefined || status === 'Up') {
      let now = new Date();
      let randomValue = (Math.random() * (432.0 - 35.0) + 35.0).toFixed(1);
      let fakeMeasurement = {
        timestamp: now,
        value: randomValue,
        instanceId: instances[i].id,
      };
      measurements[i] = fakeMeasurement;
    }
  }

  let metricData = {
    name: metricName,
    type: MetricTypeEnum.Gauge,
    entityType: NILE_ENTITY_NAME,
    measurements: measurements,
  };
  await nile.metrics
    .produceBatchOfMetrics({
      metric: [metricData],
    })
    .catch((error: any) => {
      console.error(
        emoji.get('x'),
        `Error: cannot produce measurements: ${error}`
      );
      process.exit(1);
    });
  console.log(
    emoji.get('white_check_mark'),
      `Produced measurements:\n[ ${JSON.stringify(metricData, null, 2)} ]`
  );
}

putMetrics();
