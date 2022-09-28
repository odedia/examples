import { Box, Stack, Typography } from '@mui/joy';
import { useNile } from '@theniledev/react';
import React from 'react';

import Logo from '~/components/Logo';

export default function NavBar(props: React.PropsWithChildren) {
  const { children } = props;
  const nile = useNile();
  return (
    <Stack>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 1,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Logo width={76} />
          <Typography>{String(nile.workspace)}</Typography>
        </Stack>
      </Box>
      <Box sx={{ marginTop: 8 }}> {children} </Box>
    </Stack>
  );
}
