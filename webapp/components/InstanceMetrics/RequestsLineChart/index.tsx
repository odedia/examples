import React from 'react';
import { Card, Stack, Typography } from '@mui/joy';
import {
  AggregateMetricsRequest,
  AggregationType,
  MetricsLineChart,
  UpdateInterval,
} from '@theniledev/react';
import { useRouter } from 'next/router';
import { BucketBucketSizeEnum } from '@theniledev/js';

import { useTheme } from '../../../global-context/theme';

import { getMetrics } from '~/metrics';

export default function RequestLineChartLoader() {
  const router = useRouter();
  const instanceId = String(router.query.instance);
  const entityType = String(router.query.entity);
  const organizationId = String(router.query.org);

  if (Object.keys(router.query).length === 0) {
    return null;
  }
  return (
    <RequestLineChart
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
function RequestLineChart(props: Props) {
  const color = useTheme();
  const router = useRouter();
  const entity = String(router.query.entity);

  const { lineChart } = getMetrics(entity) ?? {};
  const METRIC_NAME = lineChart['metricName'];
  const METRIC_TITLE = lineChart['metricTitle'];

  const metricName = METRIC_NAME;
  const { instanceId, entityType, organizationId } = props;

  const metricFilter = React.useMemo<AggregateMetricsRequest>(
    () => ({
      metricName,
      aggregationType: AggregationType.Avg,
      aggregationRequest: {
        entityType,
        metricName,
        bucketSize: BucketBucketSizeEnum._10m,
        organizationId,
        numberOfBuckets: 400,
        instanceId: instanceId,
      },
    }),
    [entityType, metricName, organizationId, instanceId]
  );

  console.log(metricFilter);
  return (
    <Card variant="outlined">
      <Typography level="h4">{METRIC_TITLE}</Typography>
      <MetricsLineChart
        emptyState={
          <Stack
            sx={{
              minHeight: '200px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography>Metrics may take up to an hour to populate.</Typography>
          </Stack>
        }
        updateInterval={UpdateInterval.FiveMinutes}
        aggregation={metricFilter}
        dataset={{
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 1,
          borderColor: color.primary,
        }}
      />
    </Card>
  );
}
