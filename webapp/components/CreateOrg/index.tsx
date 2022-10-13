import React from 'react';
import { useRouter } from 'next/router';
import { Stack } from '@mui/material';
import { OrganizationForm } from '@theniledev/react';
import { Typography } from '@mui/joy';
import getConfig from 'next/config';

import NavBar from '../NavBar';

import paths from '~/paths';

export default function AddOrgForm() {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  return (
    <NavBar>
      <Stack>
        <Typography level="h5">Create your organization</Typography>
        <OrganizationForm
          onSuccess={(data) => {
            router.push(
              paths.entities({ org: data.id, entity: NILE_ENTITY_NAME }).index
            );
          }}
        />
      </Stack>
    </NavBar>
  );
}
