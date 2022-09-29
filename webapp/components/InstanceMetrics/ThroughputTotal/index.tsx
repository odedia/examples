import { Box, Card, Stack, Typography } from "@mui/joy";
import { Measurement, MetricTypeEnum } from "@theniledev/js";
import { useMetrics } from '@theniledev/react';
import getConfig from "next/config";
import { useRouter } from "next/router";
import React from "react";
import { useFirstOrg } from "~/components/EntityTable/hooks";

import { generateValueRange } from "../../../utils";
import { useMetricsGenerator } from "../hooks";

const METRIC_NAME = 'throughput';
const FOUR_SECONDS = 1000 * 4;

export default function ThroughputTotal() {
  const [metricValue, setMetricValue] = React.useState('');
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  const [, , org] = useFirstOrg();
  const router = useRouter();
  const instanceId = String(router.query.instance);

  useMetricsGenerator({
    metricName: METRIC_NAME,
    intervalTimeMs: FOUR_SECONDS,
    measurement: function (): Measurement {
      return { timestamp: new Date(), value: generateValueRange(23, 43), instanceId }
    }
  });

  const { metrics } = useMetrics({
    updateInterval: 5000,
    fromTimestamp: new Date(),
    filter: {
      metricName: METRIC_NAME,
      entityType: NILE_ENTITY_NAME,
      organizationId: org?.id
    }
  });

  const [metric] = metrics ?? [];

  React.useEffect(() => {
    if (metric) {
    const metricVal = parseFloat(metric.value.toFixed(1))
     if (String(metricVal).split('.').length === 1) {
      setMetricValue(`${String(metricVal)}.0`);
     } else {
      setMetricValue(String(metricVal));
     }
    }
  }, [metric]);


  return (
    <Box sx={{ pl: 1 }}>
      <Card variant="outlined">
        <Typography level="body3">past 5 seconds</Typography>
        <Stack direction="row" sx={{
            alignItems: "flex-end",
            padding: 11.7
          }}
        >
          <Typography fontSize={150} sx={{lineHeight: 0.8}}>
            {metricValue ? metricValue : '--'}
          </Typography>
          <Typography sx={{color: 'var(--joy-palette-grey-400)'}}>
            {metricValue? '/tbps': ''}
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}