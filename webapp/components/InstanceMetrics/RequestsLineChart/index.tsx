import React from 'react';
import { Card, Typography } from "@mui/joy";
import { MetricsLineChart } from "@theniledev/react";
import getConfig from "next/config";
import { Measurement } from '@theniledev/js';

import { generateValueRange } from '../../../utils';
import { useMetricsGenerator } from '../hooks';
import { useRouter } from 'next/router';
import { useFirstOrg } from '~/components/EntityTable/hooks';
const now = new Date();

const TEN_MINUTES_AGO = new Date(now.getTime() - .5 * 60000);
const METRIC_NAME = 'requests';

export default function RequestLineChart() {
  const router = useRouter();
  const instanceId = String(router.query.instance);
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const [, , org] = useFirstOrg();

  const metricFilter = {
    entityType: NILE_ENTITY_NAME, 
    metricName: 'requests',
    organizationId: org?.id
  }

  const [timestamp, setTimeStamp] = React.useState(TEN_MINUTES_AGO);

  useMetricsGenerator({
      metricName: 'requests',
      intervalTimeMs: 3 * 1000,
      measurement: function (): Measurement {
        return { timestamp: new Date(), value: generateValueRange(35, 432), instanceId }
      }
    },
    () => {
      const updated = new Date();
      if (timestamp < new Date(updated.getTime() - .5 * 60000)) {
        setTimeStamp(new Date(updated.getTime() - 60000));
      }
    }
  );
  
  return (
    <Card variant="outlined" sx={{
        minWidth: '560px'
      }}
    >
      <Typography level="body3">last minute</Typography>
      <MetricsLineChart 
        updateInterval={3000}
        filter={metricFilter} 
        fromTimestamp={timestamp} 
        timeFormat="HH:mm:ss"
        dataset={{
          tension: 0.3,
          pointRadius: 0,
          borderColor:'green',
        }}
        chartOptions={{
          plugins: {
            legend: {
              display: false
            },
          },
          animation: {
            duration: 400
          },
          scales: {
            y: {
                suggestedMin: 35,
                suggestedMax: 432 
            },
          }
        }}
      />
    </Card>
  )
}