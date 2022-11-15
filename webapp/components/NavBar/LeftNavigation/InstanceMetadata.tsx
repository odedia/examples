import { Stack, Typography, CircularProgress, Link } from '@mui/joy';
import { Queries, useNile } from '@theniledev/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

export default function InstanceMetadata() {
  const nile = useNile();
  const router = useRouter();
  const entity = String(router.query.entity);
  const org = String(router.query.org);
  const instanceId = String(router.query.instance);

  const { isLoading, data: instance } = useQuery(
    Queries.GetInstance(entity, org, instanceId),
    () => nile.entities.getInstance({ org, type: entity, id: instanceId }),
    { enabled: Boolean(router.query.instance) }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties = instance?.properties ?? ({} as any);
  if (!router.query.instance) {
    return null;
  }
  if (isLoading) {
    return <CircularProgress />;
  }
  return (
    <Stack spacing={1.5}>
      <Typography sx={{ fontWeight: 600 }}>Instance</Typography>
      {Object.keys(properties).map((prop) => {
        const value = properties[prop];
        return (
          <Stack
            key={prop}
            direction="row"
            sx={{ justifyContent: 'space-between' }}
          >
            <Typography>{prop}</Typography>
            <Typography level="body2" sx={{ textAlign: 'right' }}>
              {isValidHttpUrl(value) ? (
                <Link href={value} target="_blank">
                  {value}
                </Link>
              ) : (
                value
              )}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
