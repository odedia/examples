import React from 'react';
import { Box, Card, Stack, Typography } from '@mui/joy';
import { useFilter } from '@theniledev/react';
import { Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { Measurement } from '@theniledev/js';

import Rect from './rect.svg';

import { getMetrics } from '~/metrics';

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

const THIRTY_SECONDS = 30 * 1000;
const NINETY_SECONDS = 150000;

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

  const { gaugeGraph } = getMetrics(entityType) ?? {};
  const METRIC_NAME = gaugeGraph['metricName'];
  const METRIC_TITLE = gaugeGraph['metricTitle'];

  const metricFilter = {
    entityType,
    METRIC_NAME,
    organizationId,
    instanceId: instanceId,
    startTime: new Date(new Date().getTime() - NINETY_SECONDS),
  };

  const { metrics, isLoading } = useFilter({
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
      <Stack direction="row" sx={{ overflow: 'hidden' }}>
        {metrics.map((metric: Measurement, idx: number) => {
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
