import { Chip, Link, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { LoginForm, useQuery, useNile } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';
import ChipDelete from '@mui/joy/ChipDelete';
import getConfig from 'next/config';

import Logo from '~/components/Logo';

export default function MyLoginForm() {
  const router = useRouter();

  const signup = String(router.query.signup);
  const [error, setErrorMessage] = React.useState<null | string>(null);

  const nile = useNile();
  const [hadLoginSuccess, setHadLoginSuccess] = React.useState(false);
  const { isLoading, data: me } = useQuery(
    ['/anythingelse'],
    () => nile.users.me(),
    {
      enabled: hadLoginSuccess,
    }
  );
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  React.useEffect((): void => {
    const orgMemberships = me?.orgMemberships;
    if (hadLoginSuccess && orgMemberships != null) {
      if (Object.keys(orgMemberships).length < 1) {
        router.push('/create-org');
      } else {
        router.push(`/entities/${NILE_ENTITY_NAME}`);
      }
    }
  }, [router, me, hadLoginSuccess, NILE_ENTITY_NAME]);

  return (
    <Stack
      sx={{
        height: '98vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        variant="outlined"
        sx={{ background: 'transparent', padding: 14, paddingTop: 10 }}
      >
        <Stack spacing={2}>
          <Logo width={300} />
          {error && (
            <Chip
              variant="soft"
              color="danger"
              endDecorator={
                <ChipDelete
                  variant="plain"
                  onClick={() => {
                    setErrorMessage(null);
                  }}
                />
              }
            >
              {error}
            </Chip>
          )}
          {signup && signup == 'success' && (
            <Chip variant="soft" color="success" sx={{ maxWidth: '20em' }}>
              <Typography padding={2}>Sign up successful!</Typography>
            </Chip>
          )}
          <LoginForm
            onSuccess={() => {
              setHadLoginSuccess(true);
            }}
            onError={(error) => {
              // for demo purposes only
              if (/workspace .* not found/.test(error.message)) {
                setErrorMessage(
                  'Double check your workspace name in pages/_app.tsx'
                );
              } else {
                setErrorMessage(error.message);
              }
            }}
          />
        </Stack>
        <Stack spacing={1} sx={{ marginTop: 1 }}>
          <Typography level="body4">
            Sign in using an organization user email and password.
          </Typography>
          <Typography>
            New user? <Link href="/signup">Sign up</Link>
          </Typography>
        </Stack>
      </Card>
    </Stack>
  );
}
