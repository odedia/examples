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

const ERROR_COUNT_LIMIT = 20;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var errorCount = 0;

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

  // Produce metrics for the averageNum
  const FIVE_SECONDS = 1000 * 5;
  const THIRTY_SECONDS = 1000 * 30;
  const { averageNum, gaugeGraph, lineChart } = require(`../../webapp/metrics/${NILE_ENTITY_NAME}/index.ts`);

  var currTime = 0;
  while(true) { 
    await execute('averageNum', averageNum['metricName']);
    await execute('lineChart', lineChart['metricName']);
    currTime += FIVE_SECONDS;
    if (currTime >= THIRTY_SECONDS) {
      await execute('gaugeGraph', gaugeGraph['metricName']);
      currTime = 0;
    }
    await delay(FIVE_SECONDS);
  }
}

async function execute(metricType: string, metricName: string) {

  var instances = await nile.entities.listInstancesInWorkspace({
      type: NILE_ENTITY_NAME,
    });

  let randomValue;
  let measurements = [];
  for (let i=0; i < instances.length; i++) {
    let status = instances[i].properties.status;
    if (status === undefined || status === 'Up') {
      let now = new Date();
      if (metricType === 'averageNum') {
        randomValue = (Math.random() * (83.0 - 23.0) + 23.0).toFixed(1);
      } else if (metricType === 'lineChart') {
        randomValue = (Math.random() * (432.0 - 35.0) + 35.0).toFixed(1);
      } else {
        randomValue = (Math.random() * (1 - 0)) >= 0.1 ? 1 : 0;
      }
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
  try {
    await nile.metrics
      .produceBatchOfMetrics({
        metric: [metricData],
      });
    console.log(
      emoji.get('white_check_mark'),
        `Produced measurements:\n[ ${JSON.stringify(metricData, null, 2)} ]`
    );
    errorCount = 0;
  } catch (error) {
    errorCount++;
    console.error(
      emoji.get('x'),
      `Warning ${errorCount} (${now}): cannot produce measurements: ${error}`
    );
    if (errorCount >= ERROR_COUNT_LIMIT) {
      console.error(
        emoji.get('x'),
        `Error: Could not produce ${ERROR_COUNT_LIMIT} consecutive batch of metrics. Exiting`
      );
      process.exit(1);
    }
  }
}

putMetrics().catch(console.error);
