import React from 'react';
import { Box, Link, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { InstanceTable } from '@theniledev/react';
import Unauthorized from '../Unauthorized';

import getConfig from 'next/config'
import NavBar from '../NavBar';
import { CreateInstance } from './CreateInstance';
import { useFirstOrg } from './hooks';
import { checkAccess } from '../CreateOrg/policies';


export default function ClustersTable(){
  const [reRender, setReRender] = React.useState(false);
  const [isLoading, user, org, unauthorized] = useFirstOrg();
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  const hasAccess = React.useMemo(() => checkAccess(user), [user]);

  // just a simple refresh for now.
  React.useEffect(() => {
    if (reRender === true) {
      setReRender(false);
    }
  }, [reRender]);

  if (unauthorized) {
    return <Unauthorized />
  }

  if (isLoading || !user || !org) {
    return <>Loading...</>;
  }

  return (
    <NavBar>
      <Stack spacing={2}>
        <Typography level="h3">Welcome {user?.email}!</Typography>
        <Link href="/">Log out</Link>
        <Card variant="outlined" sx={{ background: 'transparent' }}>
          <Stack direction="row" spacing={2} sx={{alignItems: 'center', marginBottom: 3 }}>
            <Typography>Organization:</Typography>
            <Typography component="strong">{org.name}</Typography>
            <Box sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              { hasAccess && (
                <CreateInstance 
                  key="create-instance" 
                  org={org.id} 
                  setReRender={() => setReRender(true)}
                />
              )}
            </Box>
          </Stack>
          {reRender ? null : (
              <InstanceTable
                org={org.id}
                entity={NILE_ENTITY_NAME}
                handleRowClick={() => alert('handle a row click')}
                columns={['dbName', 'cloud', 'environment', 'size']}
              />
            )
          }
        </Card>
      </Stack>
    </NavBar>
  )
}
