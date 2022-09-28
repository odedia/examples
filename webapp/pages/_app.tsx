import type { AppProps } from 'next/app';
import { NileProvider, useNile } from '@theniledev/react';
import { Container } from '@mui/joy';
import getConfig from 'next/config';
import '../styles/globals.css';
import React from 'react';
import Head from 'next/head';

import WelcomeToNile from '~/components/WelcomeToNile'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping

function WorkspaceChecker(props: React.PropsWithChildren) {
  const { children } = props;
  const nile = useNile();
  /**
   * Delete the code block and component after you've updated the workspace name
   */
  if (!nile.workspace) {
    return <WelcomeToNile />;
  }
  /** end delete */
  return <>{children}</>;
}

function MyApp({ Component, pageProps }: AppProps) {
  const { publicRuntimeConfig } = getConfig();
  const { NILE_WORKSPACE, NILE_URL } = publicRuntimeConfig;
  return (
    <NileProvider basePath={NILE_URL} workspace={NILE_WORKSPACE}>
      <Head>
        <title>Nile App</title>
        <meta name="description" content="Welcome to Nile" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <WorkspaceChecker>
          <Component {...pageProps} />
        </WorkspaceChecker>
      </Container>
    </NileProvider>
  );
}

export default MyApp;
