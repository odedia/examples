import { Chip, Stack, Typography } from '@mui/joy';
import Card from '@mui/joy/Card';
import { SignUpForm } from '@theniledev/react';
import { useRouter } from 'next/router';
import React from 'react';
import ChipDelete from '@mui/joy/ChipDelete';

import Logo from '~/components/Logo';

export default function MySignUpForm() {
  const router = useRouter();
  const [error, setErrorMessage] = React.useState<null | string>(null);
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
        <Stack spacing={10}>
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
          <SignUpForm
            onSuccess={() => {
              router.push('/?signup=success');
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
        <Typography level="body4" sx={{ marginTop: 1 }}>
          Sign up with your email and choose a password.
        </Typography>
      </Card>
    </Stack>
  );
}
