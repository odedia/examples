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

async function produceMetrics() {
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

  // Produce one measurement for a new metric
  const now = new Date();
  const metricName = `custom.${NILE_ENTITY_NAME}.instance.myMetric`;
  const randomValue = parseFloat(
    (Math.random() * (100.0 - 70.0) + 70.0).toFixed(2)
  );
  const fakeMeasurement = {
    timestamp: now,
    value: randomValue,
    instanceId: oneInstance,
  };

  const metricData = {
    name: metricName,
    type: MetricTypeEnum.Gauge,
    entityType: NILE_ENTITY_NAME,
    measurements: [fakeMeasurement],
  };
  await nile.metrics
    .produceBatchOfMetrics({
      metric: [metricData],
    })
    .catch((error: any) => {
      console.error(
        emoji.get('x'),
        `Error: cannot produce metrics: ${error}`
      );
      process.exit(1);
    });
  console.log(
    emoji.get('white_check_mark'),
    `Produced one measurement:\n[ ${JSON.stringify(metricData, null, 2)} ]`
  );
}

produceMetrics();
