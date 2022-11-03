import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/joy';
import { useMetrics } from '@theniledev/react';
import { Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { MetricTypeEnum } from '@theniledev/js';

import { useMetricsGenerator, useProduceMetric } from '../hooks';
import { generateValueRange } from '../../../utils';
import { getMetrics } from '~/metrics';

import Rect from './rect.svg';

const Tangle = ({ fill }: { fill: 'success' | 'danger' }) => (
  <Box
    sx={(theme) => {
      return {
        height: '3em',
        width: '1em',
        '& > svg > rect': { fill: theme.palette[fill][300] },
      };
    }}
  >
    <Rect />
  </Box>
);

const now = new Date();
const TWENTY_FOUR_HOURS_AG0 = new Date(now.getTime() - 24 * 60 * 60000);
const THIRTY_SECONDS = 30 * 1000;

export default function UpTimeLoader() {
  const router = useRouter();
  const instanceId = String(router.query.instance);
  const entityType = String(router.query.entity);
  const organizationId = String(router.query.org);
  if (Object.keys(router.query).length === 0) {
    return null;
  }

  return (
    <UpTime
      instanceId={instanceId}
      entityType={entityType}
      organizationId={organizationId}
    />
  );
}

type Props = {
  instanceId: string;
  entityType: string;
  organizationId: string;
};
function UpTime(props: Props) {
  const { instanceId, entityType, organizationId } = props;
  const produceMetric = useProduceMetric();

  const { gaugeGraph } = getMetrics(entityType) ?? {};
  const METRIC_NAME = gaugeGraph['metricName'];
  const METRIC_TITLE = gaugeGraph['metricTitle'];

  const metricName = `${entityType}-${METRIC_NAME}`;

  useMetricsGenerator({
    metricName,
    intervalTimeMs: THIRTY_SECONDS,
    measurement: () => {
      const val = generateValueRange(0, 1);
      return { timestamp: new Date(), value: val >= 0.1 ? 1 : 0, instanceId };
    },
  });

  React.useEffect(() => {
    async function producer() {
      const val = generateValueRange(0, 1);
      const fakeMeasurement = {
        timestamp: new Date(),
        value: val >= 0.1 ? 1 : 0,
        instanceId,
      };
      const metricData = {
        name: metricName,
        type: MetricTypeEnum.Gauge,
        entityType,
        measurements: [fakeMeasurement],
      };
      await produceMetric(metricData);
    }
    producer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metricFilter = {
    entityType,
    metricName,
    organizationId,
    startTime: TWENTY_FOUR_HOURS_AG0,
  };

  const { metrics, isLoading } = useMetrics({
    filter: metricFilter,
    updateInterval: THIRTY_SECONDS,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ overflow: 'scroll' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1 }}>
        <Typography level="h4">{METRIC_TITLE}</Typography>
        <Typography level="body3">past 24 hours</Typography>
      </Stack>
      <Stack direction="row">
        {metrics.map((metric, idx) => {
          if (metric.value === 0) {
            return (
              <Tooltip key={idx} title={"🤪 Oh nooo! It's broked 🤪"}>
                <Box sx={{ height: '3rem', width: '1rem' }}>
                  <Tangle key={idx} fill="danger" />
                </Box>
              </Tooltip>
            );
          }
          return (
            <Box key={idx}>
              <Tangle fill="success" />
            </Box>
          );
        })}
      </Stack>
    </Card>
  );
}
