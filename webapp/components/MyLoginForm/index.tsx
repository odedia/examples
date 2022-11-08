import { Box, Chip, Link, Sheet, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { LoginForm, useNile } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';
import ChipDelete from '@mui/joy/ChipDelete';
import getConfig from 'next/config';

import Logo from '~/components/Logo';
import LoginBG from '~/images/loginbg.svg';
import paths from '~/paths';

export default function MyLoginForm() {
  const router = useRouter();

  const signup = String(router.query.signup);
  const [error, setErrorMessage] = React.useState<null | string>(null);

  const nile = useNile();
  const [hadLoginSuccess, setHadLoginSuccess] = React.useState(false);
  const { data: me } = useQuery(['/anythingelse'], () => nile.users.me(), {
    enabled: hadLoginSuccess,
  });
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME, NILE_WORKSPACE } = publicRuntimeConfig;
  React.useEffect((): void => {
    const orgMemberships = me?.orgMemberships;
    if (hadLoginSuccess && orgMemberships != null) {
      if (Object.keys(orgMemberships).length < 1) {
        router.push(paths.org({}).create);
      } else {
        const [org] = Object.keys(orgMemberships);
        const entity = NILE_ENTITY_NAME;
        router.push(paths.entities({ org, entity }).index);
      }
    }
  }, [router, me, hadLoginSuccess, NILE_ENTITY_NAME]);

  return (
    <Sheet>
      <Box
        sx={{
          backgroundColor: 'var(--mui-palette-primary-light)',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          width: '50em',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ opacity: 0.3 }}>
          <LoginBG width="545px" style={{ transform: 'scale(2)' }} />
        </Box>
      </Box>
      <Stack
        sx={{
          height: '98vh',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'calc(100vw - 50em)',
        }}
      >
        <Card
          variant="outlined"
          sx={{ background: 'transparent', padding: 14, paddingTop: 10 }}
        >
          <Stack spacing={2}>
            <Stack sx={{ alignItems: 'center' }}>
              <Logo width={300} />
              <Typography level="h4">{NILE_ENTITY_NAME} SaaS</Typography>
              <Typography level="h7">{NILE_WORKSPACE}</Typography>
            </Stack>
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
              New user? <Link href={paths.signup}>Sign up</Link>
            </Typography>
          </Stack>
        </Card>
      </Stack>
    </Sheet>
  );
}
