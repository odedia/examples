import { Typography, Box, Sheet, Stack } from '@mui/joy';
import IconButton from '@mui/joy/IconButton';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useRouter } from 'next/router';
import getConfig from 'next/config';

import InstanceMetadata from './InstanceMetadata';

import Logo from '~/components/Logo';
import { useFirstOrg } from '~/components/EntityTable/hooks';
import { CreateInstance } from '~/components/EntityTable/CreateInstance';
import { AddUser } from '~/components/EntityTable/AddUser';

type Props = {
  allowCreation?: boolean;
  entity?: string;
};
export default function LeftNavigation(props: Props) {
  const router = useRouter();
  const { allowCreation = false, entity } = props;
  const { publicRuntimeConfig } = getConfig();
  const [, , org] = useFirstOrg();

  const { NILE_ENTITY_NAME } = publicRuntimeConfig;

  return (
    <>
      <Sheet
        sx={{
          backgroundColor: 'var(--mui-palette-primary-main)',
          minHeight: '100vh',
        }}
      >
        <Box sx={{ position: 'sticky', top: '120px' }}>
          <Stack
            spacing={5}
            sx={{
              p: 2,
              pr: 8,
              height: '100%',
            }}
          >
            <IconButton variant="plain" onClick={() => router.push('/')}>
              <LogoutOutlinedIcon sx={{ color: 'white' }} />
            </IconButton>
          </Stack>
        </Box>
      </Sheet>

      <Sheet
        sx={{
          borderRadius: '2rem',
          borderRight: '1px solid var(--mui-palette-neutral-outlinedBorder)',
          marginLeft: -6,
          posiiton: 'relative',
          zIndex: 3,
        }}
      >
        <Sheet
          sx={{
            borderRadius: '2rem',
            position: 'relative',
            zIndex: 1,
            height: '100%',
          }}
        >
          <Stack
            spacing={6}
            sx={{
              px: 2.5,
              position: 'relative',
              zIndex: 1,
              height: '100%',
            }}
          >
            <Stack>
              <Stack
                sx={{
                  padding: 2,
                  jusifyContent: 'center',
                  alignItems: 'center',
                  minWidth: 200,
                }}
                direction="row"
                spacing={2}
              >
                <Box sx={{ ml: -4 }}>
                  <Logo width={80} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: 48,
                    background:
                      'linear-gradient(to bottom right, var(--mui-palette-primary-light), var(--mui-palette-primary-dark))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {NILE_ENTITY_NAME} SaaS
                </Typography>
              </Stack>
              <Stack>
                <Typography sx={{ fontWeight: 600 }}>
                  My organizations
                </Typography>
                <Typography sx={{ ml: 3, mt: 1 }}>{org?.name}</Typography>
              </Stack>
            </Stack>
            <InstanceMetadata />
            {org && allowCreation && entity && (
              <CreateInstance
                key="create-instance"
                org={org?.id}
                entity={entity}
              />
            )}
            <AddUser key="add-user" org={org?.id} />
          </Stack>
        </Sheet>
        <Sheet
          sx={(theme) => ({
            boxShadow: theme.shadow.xl,
            minHeight: '100vh',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '100px',
            right: 0,
            borderRadius: '2rem',
            zIndex: 0,
          })}
        />
      </Sheet>
    </>
  );
}
