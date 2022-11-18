import { Box, IconButton, Link, Stack, Typography } from '@mui/joy';
import { Queries, useNile, StartTime } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/router';

import NavBar from '../NavBar';

import RequestLineChart from './RequestsLineChart';
import ThroughputTotal from './ThroughputTotal';
import UpTime from './UpTime';

import { getFormFields } from '~/form-fields';
import paths from '~/paths';

export default function InstanceMetrics() {
  const router = useRouter();

  const entity = String(router.query.entity);
  const instanceId = String(router.query.instance);
  const org = String(router.query.org);

  const nile = useNile();
  const { instanceName } = getFormFields(entity) ?? {};
  const { data: instance } = useQuery(
    Queries.GetInstance(entity, org, instanceId),
    () =>
      nile.entities.getInstance({
        org,
        type: entity,
        id: instanceId,
      }),
    { enabled: Object.keys(router.query).length !== 0 }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { properties } = instance ?? ({} as Record<string, any>);

  return (
    <NavBar>
      <Stack sx={{ pt: 3, alignItems: 'center' }} direction="row" spacing={1}>
        <Box>
          <Link href={paths.entities(router.query).index}>
            <IconButton variant="outlined" size="sm">
              <ArrowBackIcon />
            </IconButton>
          </Link>
        </Box>
        <Typography level="body2">Back</Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: 'space-between', pb: 2 }}>
        <Stack sx={{ alignItems: 'flex-start' }}>
          {instanceName && (
            <Typography level="h2">{properties?.[instanceName]}</Typography>
          )}
          <Typography level="body4">{instance?.id}</Typography>
        </Stack>
      </Stack>
      <Stack spacing={2}>
        <StartTime />
        <UpTime />
        <Stack
          sx={{
            gap: 2,
            flexWrap: 'wrap',
            mt: 2,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
          direction="row"
        >
          <RequestLineChart />
          <ThroughputTotal />
        </Stack>
      </Stack>
    </NavBar>
  );
}
