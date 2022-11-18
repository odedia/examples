import { Card, Stack, Typography } from '@mui/joy';
import { UpdateInterval, useFilter } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';

import { getMetrics } from '~/metrics';

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
  const [metricValue, setMetricValue] = React.useState('');

  const { averageNum } = getMetrics(entityType) ?? {};
  const METRIC_NAME = averageNum['metricName'];
  const METRIC_TITLE = averageNum['metricTitle'];
  const metricName = METRIC_NAME;

  const metricPayload = React.useMemo(
    () => ({
      updateInterval: UpdateInterval.ThirtySeconds,
      filter: {
        metricName,
        entityType,
        organizationId,
        instanceId,
        startTime: new Date(new Date().getTime() - 3.6e6), // an hour ago
      },
    }),
    [entityType, metricName, organizationId, instanceId]
  );
  const { metrics } = useFilter(metricPayload);

  React.useEffect(() => {
    const metric = metrics?.pop();
    if (metric) {
      const metricVal = parseFloat(metric.value.toFixed(1));
      if (String(metricVal).split('.').length === 1) {
        setMetricValue(`${String(metricVal)}.0`);
      } else {
        setMetricValue(String(metricVal));
      }
    }
  }, [metrics]);

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
        </Stack>
      </Card>
    </Stack>
  );
}
