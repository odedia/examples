import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/joy/IconButton';

import { useFirstOrg } from '../../EntityTable/hooks';
import ModeToggle from '../../NavBar/ModeToggler';
import { useTheme } from '../../../global-context/theme';

import QuotaArc from './QuotaArc';
import ProviderUsage from './ProviderUsage';
import Colorizor from './Colorizer';

import Upgrade from '~/images/upgrade.svg';

type Props = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
};
export default function RightSidebar(props: Props) {
  const color = useTheme();
  const { isSidebarOpen, setIsSidebarOpen } = props;
  const [isLoading, user] = useFirstOrg();

  if (isLoading) {
    return <CircularProgress />;
  }

  const [name] = user?.email.split('@') ?? [];

  const shortName = name.length > 1 ? `${name[0]}${name[1]}` : name[0];
  return (
    <Box
      sx={{
        transition: 'visibility .5s ease-in',
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        visibility: `${isSidebarOpen ? 'visible' : 'hidden'}`,
        minHeight: '100vh',
      }}
    >
      <Sheet
        sx={(theme) => ({
          border: '1px solid',
          borderColor: 'var(--mui-palette-neutral-outlinedBorder)',
          borderRight: 'none',
          transition: 'transform .3s ease-in',
          transform: `translateX(${isSidebarOpen ? 0 : '400px'})`,
          p: 3,
          borderTopLeftRadius: '2rem',
          borderBottomLeftRadius: '2rem',
          boxShadow: theme.shadow.xl,
          height: '100%',
          maxWidth: 400,
          zIndex: 1,
        })}
      >
        <Stack spacing={3} sx={{ height: '100%' }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              margin: '0 auto',
            }}
          >
            <IconButton
              variant="plain"
              color="neutral"
              onClick={() => setIsSidebarOpen(false)}
              sx={{ position: 'absolute', left: '4px' }}
            >
              <CloseIcon />
            </IconButton>

            <ModeToggle />
            <Box
              sx={{
                borderLeft: '1px solid var(--mui-palette-neutral-300)',
                height: '40px',
              }}
            />
            <Typography level="body2" sx={{ whiteSpace: 'nowrap', p: 1 }}>
              Hi, {name}
            </Typography>
            <Avatar
              variant="soft"
              sx={{ border: '1px solid var(--mui-palette-primary-light)' }}
            >
              {shortName}
            </Avatar>
          </Stack>
          <Colorizor />
          <QuotaArc />
          <ProviderUsage />
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                bottom: '24px',
                borderRadius: '2rem',
                padding: 3,
                background:
                  'linear-gradient(var(--mui-palette-primary-solidDisabledColor), var(--mui-palette-primary-outlinedActiveBg))',
              }}
            >
              <Stack sx={{ alignItems: 'center' }} spacing={1}>
                <Box
                  sx={{
                    '& svg > g': {
                      ellipse: {
                        stroke: `${color.primary}!important`,
                      },
                      path: {
                        stroke: `${color.primary}!important`,
                      },
                    },
                  }}
                >
                  <Upgrade />
                </Box>
                <Typography component="strong">Upgrade to Pro</Typography>
                <Typography level="body3" sx={{ textAlign: 'center' }}>
                  Get access to larger databases, VPC peering and many other
                  features
                </Typography>
                <Button sx={{ width: '80%' }}>Upgrade now</Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Sheet>
    </Box>
  );
}
