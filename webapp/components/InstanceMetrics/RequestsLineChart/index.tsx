import React from 'react';
import { Card } from '@mui/joy';
import { MetricsLineChart } from '@theniledev/react';
import { Measurement } from '@theniledev/js';
import { useRouter } from 'next/router';

import { generateValueRange } from '../../../utils';
import { useMetricsGenerator } from '../hooks';
import { useTheme } from '../../../global-context/theme';

import { getMetrics } from '~/metrics';

const now = new Date();

const TEN_MINUTES_AGO = new Date(now.getTime() - 0.5 * 60000);

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

  const metricName = `${entity}-${METRIC_NAME}`;
  const { instanceId, entityType, organizationId } = props;

  const [timestamp, setTimeStamp] = React.useState(TEN_MINUTES_AGO);

  const metricFilter = React.useMemo(
    () => ({
      entityType,
      metricName,
      organizationId,
      startTime: timestamp,
    }),
    [entityType, metricName, organizationId, timestamp]
  );

  useMetricsGenerator(
    {
      metricName,
      intervalTimeMs: 3 * 1000,
      measurement: function (): Measurement {
        return {
          timestamp: new Date(),
          value: generateValueRange(35, 432),
          instanceId,
        };
      },
    },
    () => {
      const updated = new Date();
      if (timestamp < new Date(updated.getTime() - 0.5 * 60000)) {
        setTimeStamp(new Date(updated.getTime() - 60000));
      }
    }
  );

  return (
    <Card variant="outlined">
      <MetricsLineChart
        updateInterval={3000}
        filter={metricFilter}
        timeFormat="HH:mm:ss"
        dataset={{
          tension: 0.3,
          pointRadius: 0,
          borderColor: color.primary,
        }}
        chartOptions={{
          plugins: {
            legend: {
              display: false,
            },
          },
          animation: {
            duration: 400,
          },
          scales: {
            y: {
              suggestedMin: 35,
              suggestedMax: 432,
            },
          },
        }}
      />
    </Card>
  );
}
