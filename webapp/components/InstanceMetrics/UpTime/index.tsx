import { Box, Card, Stack, Typography } from "@mui/joy";
import Rect from './rect.svg';
import { useMetrics } from "@theniledev/react";
import getConfig from "next/config";
import { Tooltip } from "@mui/material";
import { useRouter } from "next/router";

import { useMetricsGenerator } from '../hooks';
import { generateValueRange } from "../../../utils";
import { useFirstOrg } from "~/components/EntityTable/hooks";

const Tangle = ({fill}: {fill: 'success' | 'danger'}) => (
  <Box sx={(theme) => {
    return { 
      height: '3em',
      width: '1em',
      '& > svg > rect': { fill: theme.palette[fill][300] } 
    }}}
  >
    <Rect />
  </Box>
);

const METRIC_NAME = 'uptime'
const now = new Date();
const TWENTY_FOUR_HOURS_AG0 = new Date(now.getTime() - 24 * 60 * 60000);
const THRITY_SECONDS = 30 * 1000;

export default function UpTime() {
  const router = useRouter();
  const instanceId = String(router.query.instance);

  const [, , org] = useFirstOrg();

  useMetricsGenerator({
    metricName: METRIC_NAME, 
    intervalTimeMs: THRITY_SECONDS,
    measurement: () => {
      const val = generateValueRange(0, 1);
      return { timestamp: new Date(), value: val >= 0.1 ? 1 : 0, instanceId }
    }
  });

  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const metricFilter = {
    entityType: NILE_ENTITY_NAME, 
    metricName: METRIC_NAME,
    organizationId: org?.id
  }

  const { metrics, isLoading } = useMetrics({
    fromTimestamp: TWENTY_FOUR_HOURS_AG0,
    filter: metricFilter,
    updateInterval: THRITY_SECONDS,
  });

  if (isLoading) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ overflow: 'scroll' }}>
      <Stack direction="row" sx={{justifyContent: "space-between", mb: 1}}>
        <Typography>Up time</Typography>
        <Typography level="body3">past 24 hours</Typography>
      </Stack>
        <Stack direction="row">
            {metrics.map((metric, idx)=> {
              if (metric.value === 0) {
                return (
                  <Tooltip key={idx} title={"🤪 Oh nooo! It's broked 🤪"}>
                    <Box sx={{height: '3rem', width: '1rem' }}>
                      <Tangle key={idx} fill="danger"/>
                    </Box>
                  </Tooltip>
                );
              }
              return <Box key={idx}><Tangle fill={'success'} /></Box>;
            })}
        </Stack>
    </Card>
  );
}