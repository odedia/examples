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

const { averageNum, gaugeGraph, lineChart } = require(`../../webapp/metrics/${NILE_ENTITY_NAME}/index.ts`);
const ERROR_COUNT_LIMIT = 20;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
var errorCount = 0;
var measurements = [];
resetMeasurements();

function resetMeasurements() {
  measurements[averageNum['metricName']] = []
  measurements[lineChart['metricName']] = []
  measurements[gaugeGraph['metricName']] = []
}

async function refreshInstanceList() : Promise< Instance[] | null > {
  var instances = await nile.entities.listInstancesInWorkspace({
      type: NILE_ENTITY_NAME,
    });
  console.log("\n");
  console.log(emoji.get('hammer_and_wrench'), ` Generating metrics for instance type ${NILE_ENTITY_NAME} where status === undefined || status === 'Up':`);
  var upInstances = instances.filter(instance => { return (instance.properties.status === undefined || instance.properties.status === 'Up') } );
  upInstances.forEach((instance) => console.log(instance.id));
  console.log("\n");
  return upInstances;
}

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
  const SIXTY_SECONDS = 1000 * 60;

  // Produce some metrics quickly
  var instances = await refreshInstanceList();
  await concatMeasurements(instances, 'averageNum', averageNum['metricName']);
  await concatMeasurements(instances, 'lineChart', lineChart['metricName']);
  await concatMeasurements(instances, 'gaugeGraph', gaugeGraph['metricName']);
  await bulkProduceMeasurements(averageNum['metricName']);
  await bulkProduceMeasurements(lineChart['metricName']);
  await bulkProduceMeasurements(gaugeGraph['metricName']);
  resetMeasurements();

  var currTime = 0;
  var produceBulkTime = 0;
  while(true) { 

    // Gather these metrics every FIVE_SECONDS
    await concatMeasurements(instances, 'averageNum', averageNum['metricName']);
    await concatMeasurements(instances, 'lineChart', lineChart['metricName']);

    currTime += FIVE_SECONDS;

    // Gather these metrics every THIRTY_SECONDS
    if (currTime >= THIRTY_SECONDS) {
      await concatMeasurements(instances, 'gaugeGraph', gaugeGraph['metricName']);
      currTime = 0;
    }

    // Bulk produce measurements to Nile once every SIXTY_SECONDS
    produceBulkTime += FIVE_SECONDS;
    if (produceBulkTime >= SIXTY_SECONDS) {
      await bulkProduceMeasurements(averageNum['metricName']);
      await bulkProduceMeasurements(lineChart['metricName']);
      await bulkProduceMeasurements(gaugeGraph['metricName']);
      resetMeasurements();
      produceBulkTime = 0;
      // Get instances again in case there are new ones
      instances = await refreshInstanceList();
    }
    await delay(FIVE_SECONDS);
  }
}

async function concatMeasurements(instances: Instance[], metricType: string, metricName: string) {
 
  let randomValue;
  var tempMeasurements = [];
  let now = new Date();
  for (let i=0; i < instances.length; i++) {
    now = new Date();
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
    tempMeasurements[i] = fakeMeasurement;
  }
  measurements[metricName] = measurements[metricName].concat(tempMeasurements);
  console.log(`${now} Storing up measurements for ${metricName}`);
}

async function bulkProduceMeasurements(metricName) {

  let metricData = {
    name: metricName,
    type: MetricTypeEnum.Gauge,
    entityType: NILE_ENTITY_NAME,
    measurements: measurements[metricName],
  };

  try {
    await nile.metrics
      .produceBatchOfMetrics({
        metric: [metricData],
      });
    let now = new Date();
    console.log(
      emoji.get('white_check_mark'),
        `${now} Produced measurements:\n[ ${JSON.stringify(metricData, null, 2)} ]`
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
