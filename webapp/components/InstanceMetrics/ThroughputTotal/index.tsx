import { Card, Stack, Typography } from '@mui/joy';
import { Measurement } from '@theniledev/js';
import { useMetrics } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';

import { generateValueRange } from '../../../utils';
import { useMetricsGenerator } from '../hooks';

import { getMetrics } from '~/metrics';

const FOUR_SECONDS = 1000 * 4;

export default function ThroughputTotalLoader() {
  const router = useRouter();
  const instanceId = String(router.query.instance);
  const entityType = String(router.query.entity);
  const organizationId = String(router.query.org);

  if (Object.keys(router.query).length === 0) {
    return null;
  }
  return (
    <ThroughputTotal
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

function ThroughputTotal(props: Props) {
  const { instanceId, entityType, organizationId } = props;
  const router = useRouter();
  const entity = String(router.query.entity);
  const [metricValue, setMetricValue] = React.useState('');

  const { averageNum } = getMetrics(entityType) ?? {};
  const METRIC_NAME = averageNum['metricName'];
  const METRIC_TITLE = averageNum['metricTitle'];
  const metricName = `${entity}-${METRIC_NAME}`;

  useMetricsGenerator({
    metricName,
    intervalTimeMs: FOUR_SECONDS,
    measurement: function (): Measurement {
      return {
        timestamp: new Date(),
        value: generateValueRange(23, 43),
        instanceId,
      };
    },
  });

  const metricPayload = React.useMemo(
    () => ({
      updateInterval: 5000,
      filter: {
        startTime: new Date(),
        metricName,
        entityType,
        organizationId,
      },
    }),
    [entityType, metricName, organizationId]
  );
  const { metrics } = useMetrics(metricPayload);

  const [metric] = metrics ?? [];

  React.useEffect(() => {
    if (metric) {
      const metricVal = parseFloat(metric.value.toFixed(1));
      if (String(metricVal).split('.').length === 1) {
        setMetricValue(`${String(metricVal)}.0`);
      } else {
        setMetricValue(String(metricVal));
      }
    }
  }, [metric]);

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <Typography level="h4">{METRIC_TITLE}</Typography>
        <Typography level="body3">Last 60 seconds</Typography>
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-end',
            padding: 4.1,
          }}
        >
          <Typography fontSize={150} sx={{ lineHeight: 0.8 }}>
            {metricValue ? metricValue : '--'}
          </Typography>
          <Typography sx={{ color: 'var(--joy-palette-grey-400)' }}>
            {metricValue ? '/ms' : ''}
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
