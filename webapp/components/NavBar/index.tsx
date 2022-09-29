import { Box, Button, Sheet, Stack, Typography } from '@mui/joy';
import { useNile } from '@theniledev/react';
import React from 'react';

import Logo from '~/components/Logo';
import { useFirstOrg } from '../EntityTable/hooks';
export default function NavBar(props: React.PropsWithChildren) {
  const { children } = props;
  const nile = useNile();
  const [isLoading, user] = useFirstOrg();
  return (
    <Stack>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
      }}>
        <Sheet variant='soft' sx={{ padding: 1 }}>
          <Stack direction="row" sx={{justifyContent: 'space-between'}}>
          <Stack direction="row" spacing={2} sx={{alignItems: 'center'}}>
            <Logo width={76} />
            <Typography>{String(nile.workspace)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
            <Typography level="h4">Welcome {user?.email}!</Typography>
            <Box>
              <Button variant="plain" component="a" href="/">Log out</Button>
            </Box>
          </Stack>
          </Stack>
        </Sheet>
      </Box>
      <Box sx={{marginTop: 12}}>
        {children}
      </Box>
    </Stack>
  );
}
