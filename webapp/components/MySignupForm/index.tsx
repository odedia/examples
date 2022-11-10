import { Box, Chip, Link, Sheet, Stack, Typography } from '@mui/joy';
import { SignUpForm } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';
import ChipDelete from '@mui/joy/ChipDelete';
import getConfig from 'next/config';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

import LoginBG from '~/images/loginbg.svg';
import Logo from '~/components/Logo';
import paths from '~/paths';

export default function MySignUpForm() {
  const router = useRouter();
  const [error, setErrorMessage] = React.useState<null | string>(null);
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  return (
    <Sheet>
      <Stack direction="row" sx={{ height: '100%' }}>
        <Stack
          sx={{
            p: 14,
            alignItems: 'center',
            width: '100%',
          }}
          spacing={8}
        >
          <Stack spacing={3} sx={{ width: '500px' }}>
            <Typography level="h4">
              Get started with <i>{NILE_ENTITY_NAME} SaaS</i>
            </Typography>
            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
              <MoneyOffIcon sx={{ fontSize: 40, color: 'rgb(72 187 132)' }} />
              <Stack>
                <Typography level="h6">It&apos;s Free</Typography>
                <Typography level="body3">
                  Use our cloud for the first 12 months for free
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
              <ChildFriendlyIcon
                sx={{ fontSize: 40, color: 'rgb(251 165 65)' }}
              />
              <Stack>
                <Typography level="h6">Easy to use</Typography>
                <Typography level="body3">
                  Our world class frameworks make you productive day one.
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
              <EngineeringIcon sx={{ fontSize: 40, color: 'rgb(78 38 170)' }} />
              <Stack>
                <Typography level="h6">Multi-tenant</Typography>
                <Typography level="body3">
                  Focus on building your core product. When the time comes,
                  scale effortlessly and instantly, while maintaining low costs.
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
              <CloudDoneIcon sx={{ fontSize: 40, color: 'rgb(57 144 251)' }} />
              <Stack>
                <Typography level="h6">Multi-cloud</Typography>
                <Typography level="body3">
                  Keep yourself safe from vendor lock by choosing the right
                  cloud for your business
                </Typography>
              </Stack>
            </Stack>
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
          <Stack spacing={3}>
            <Typography level="h5" sx={{ marginTop: 1 }}>
              Sign up with your email and choose a password.
            </Typography>
            <Box sx={{ width: 320, 'form > button': { width: '120px' } }}>
              <SignUpForm
                onSuccess={() => {
                  router.push(paths.signupSuccess);
                }}
                onError={(error) => {
                  // for demo purposes only
                  if (/workspace .* not found/.test(error.message)) {
                    setErrorMessage("We're unable to find the workspace");
                  } else {
                    setErrorMessage(error.message);
                  }
                }}
              />
            </Box>
            <Typography>
              Already have an account? <Link href={paths.index}>Log in</Link>
            </Typography>
          </Stack>
        </Stack>

        <Stack
          sx={{
            alignItems: 'flex-end',
            flex: 1,
            justifyContent: 'flex-end',
            position: 'relative',
          }}
        >
          <Stack
            sx={{
              height: '100vh',
              justifyContent: 'center',
            }}
          >
            <Stack
              sx={{
                position: 'relative',
                zIndex: 2,
                alignItems: 'flex-start',
                p: 8,
                width: '50em',
                backgroundColor:
                  'rgba(var(--mui-palette-primary-darkChannel)/ 0.8)',
              }}
            >
              <Logo
                width={300}
                color="var(--mui-palette-primary-contrastText)"
              />
              <Typography
                level="h2"
                sx={{
                  fontWeight: 600,
                  color: 'var(--mui-palette-primary-contrastText)',
                }}
              >
                Welcome to {NILE_ENTITY_NAME} SaaS
              </Typography>
            </Stack>
            <Box
              sx={{
                backgroundColor: 'var(--mui-palette-primary-light)',
                position: 'absolute',
                width: '50em',
                right: 0,
                top: 0,
                bottom: 0,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ opacity: 0.3 }}>
                <LoginBG width="545px" style={{ transform: 'scale(2)' }} />
              </Box>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Sheet>
  );
}
