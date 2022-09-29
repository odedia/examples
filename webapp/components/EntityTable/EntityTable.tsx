import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { InstanceTable } from '@theniledev/react';
import getConfig from 'next/config';

import Unauthorized from '../Unauthorized';
import NavBar from '../NavBar';

import { CreateInstance } from './CreateInstance';
import { useFirstOrg } from './hooks';
import { useRouter } from 'next/router';

import { columns } from './FormFields';

export default function ClustersTable() {
  const router = useRouter();
  const [reRender, setReRender] = React.useState(false);
  const [isLoading, user, org, unauthorized] = useFirstOrg();
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const { tableColumns } = columns;

  // just a simple refresh for now.
  React.useEffect(() => {
    if (reRender === true) {
      setReRender(false);
    }
  }, [reRender]);

  if (unauthorized) {
    return <Unauthorized />;
  }

  if (isLoading || !user || !org) {
    return <>Loading...</>;
  }

  return (
    <NavBar>
      <Stack spacing={2}>
        <Card variant="outlined" sx={{ background: 'transparent' }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', marginBottom: 3 }}
          >
            <Typography>Organization:</Typography>
            <Typography component="strong">{org.name}</Typography>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <CreateInstance
                key="create-instance"
                org={org.id}
                setReRender={() => setReRender(true)}
              />
            </Box>
          </Stack>
          {reRender ? null : (
            <InstanceTable
              org={org.id}
              entity={NILE_ENTITY_NAME}
              handleRowClick={() => alert('handle a row click')}
              columns={tableColumns}
            />
          )}
        </Card>
      </Stack>
    </NavBar>
  );
}
