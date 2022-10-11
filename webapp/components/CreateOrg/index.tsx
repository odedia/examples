import React from 'react';
import { useRouter } from 'next/router';
import { Alert, Stack } from '@mui/material';
import { CreateOrganizationRequest } from '@theniledev/js';
import { useMutation } from '@tanstack/react-query';
import { useNile } from '@theniledev/react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Box } from '@mui/joy';
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
        <Typography level="h5">
          Yo, you new around here?
        </Typography>
        <OrganizationForm
          onSuccess={(data) => {
            router.push(
              paths.entities({ org: data.id, entity: NILE_ENTITY_NAME }).index
            );
          }}
          cancelButton={<Button variant="outlined">Cancel</Button>}
        />
      />
    </NavBar>
  );
}
