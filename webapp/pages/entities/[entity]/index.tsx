import { Stack, Typography } from '@mui/joy';
import type { NextPage } from 'next';
import getConfig from 'next/config';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import EntityTable from '~/components/EntityTable'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
import NavBar from '~/components/NavBar';

const Clusters: NextPage = () => {
  const router = useRouter();
  const { publicRuntimeConfig } = getConfig();
  const { NILE_ENTITY_NAME } = publicRuntimeConfig;
  const urlEntity = String(router.query.entity);
  if (urlEntity !== NILE_ENTITY_NAME) {
    return (
      <>
        <Head>Not found</Head>
        <NavBar>
          <Stack
            sx={{
              height: 'calc(calc(100vh - 64px) / 2)',
              justifyContent: 'center',
            }}
          >
            <Typography level="h1">Entity {urlEntity} not found.</Typography>
            <Typography level="h4">
              The entity in the url does not match the entity name in the
              configuration.
            </Typography>
          </Stack>
        </NavBar>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Clusters | Nile</title>
        <meta name="description" content="Clusters by user organization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <EntityTable />
    </>
  );
};
export default Clusters;
