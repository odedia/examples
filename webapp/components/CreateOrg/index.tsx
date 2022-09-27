import React from 'react';
import { useRouter } from 'next/router';
import { Alert, Stack } from '@mui/material';
import { CreateOrganizationRequest, Organization } from '@theniledev/js';
import { Queries, useMutation, useNile } from '@theniledev/react';
import { useForm } from 'react-hook-form';
import { TextField, Button, Typography, Box } from '@mui/joy';

import NavBar from '../NavBar';
import getConfig from 'next/config';
import { useAddOrgPolicy } from './policies';

export default function AddOrgForm() {
  const nile = useNile();
  const router = useRouter();
  const { register, handleSubmit } = useForm();
  const [error, setError] = React.useState<null | string>();
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const addOrgPolicy = useAddOrgPolicy();

  const handleMutationSuccess = React.useCallback(async (data: Organization) => {
      if (!NILE_ENTITY_NAME) {
        alert('no entity type has been entered.')
      } else {
        await addOrgPolicy(data.id);
        router.push(`/entities/${NILE_ENTITY_NAME}`);
      }
  }, [NILE_ENTITY_NAME, addOrgPolicy, router])

  const mutation = useMutation(
    (data: CreateOrganizationRequest) =>
      nile.organizations.createOrganization({
        createOrganizationRequest: data,
      }),
    {
      onSuccess: handleMutationSuccess,
      onError: (e: Error) => {
        if (typeof e.message === 'string') {
          setError(e.message);
        }
      },
    }
  );

  const handleUpdate = React.useCallback(
    async (data: CreateOrganizationRequest) => {
      setError(null);
      mutation.mutate(data);
    },
    [mutation]
  );

  return (
    <NavBar>
      <Stack spacing={2} mt={3}>
        <Typography level="h5">Organization name</Typography>
        <Stack
          component="form"
          spacing={1}
          onSubmit={handleSubmit((data) =>
            handleUpdate(data as CreateOrganizationRequest)
          )}
        >
          <TextField
            {...register('name')}
            sx={{ maxWidth: '30rem' }}
            id="name"
            name="name"
            label="Name"
            required
            helperText={<>{error && <Alert severity="error">{error}</Alert>}</>}
            onChange={() => setError(null)}
            error={Boolean(error)}
          />
          <Box>
            <Button type="submit">Create organization</Button>
          </Box>
        </Stack>
      </Stack>
    </NavBar>
  );
}
