import type { AppProps } from 'next/app';
import { NileProvider, useNile } from '@theniledev/react';
import getConfig from 'next/config';
import '../styles/globals.css';
import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useColorScheme } from '@mui/joy/styles';
import { Mode } from '@mui/system/cssVars/useCurrentColorScheme';

import { useTheme, Provider as ColorProvider } from '../global-context/theme';
import theme from '../styles/theme';

import WelcomeToNile from '~/components/WelcomeToNile'; // https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping
import Footer from '~/components/Footer';

function WorkspaceChecker(props: React.PropsWithChildren) {
  const { children } = props;
  const { setMode, systemMode } = useColorScheme();
  React.useEffect(() => {
    setMode(systemMode as Mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

function WithGlobalLoader({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
  }, []);

  if (ready && router.isReady) return <>{children}</>;

  return <></>;
}

function PostColorizor(props: { children: JSX.Element }) {
  const { publicRuntimeConfig } = getConfig();
  const { NILE_WORKSPACE, NILE_URL } = publicRuntimeConfig;
  const color = useTheme();
  const { children } = props;

  return (
    <NileProvider
      basePath={NILE_URL}
      workspace={NILE_WORKSPACE}
      theme={theme(color.primary)}
    >
      {children}
    </NileProvider>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const { publicRuntimeConfig } = getConfig();
  const { NILE_WORKSPACE } = publicRuntimeConfig;

  return (
    <ColorProvider>
      <WithGlobalLoader>
        <Head>
          <title>{NILE_WORKSPACE} | powered on Nile</title>
          <meta name="description" content={`Welcome to ${NILE_WORKSPACE}`} />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <PostColorizor>
          <WorkspaceChecker>
            <Component {...pageProps} />
            <Footer />
          </WorkspaceChecker>
        </PostColorizor>
      </WithGlobalLoader>
    </ColorProvider>
  );
}

export default MyApp;
