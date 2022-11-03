/**
 * Developer auth is a stop gap for the webapp to generate mock metrics for the data plane.
 * Ideally, for examples, this would not be in the webapp because a non-webapp component would generate metrics.
 * In production, the data plane would emit its own real metrics
 */
import Nile, { NileApi } from '@theniledev/js';
import getConfig from 'next/config';
import React from 'react';

export const useDeveloperNile = (): void | NileApi => {
  const [_nile, setNile] = React.useState<NileApi>();
  const { publicRuntimeConfig } = getConfig();

  const {
    NILE_URL,
    NILE_WORKSPACE,
    NILE_WORKSPACE_ACCESS_TOKEN,
    NILE_DEVELOPER_EMAIL,
    NILE_DEVELOPER_PASSWORD,
  } = publicRuntimeConfig;

  React.useEffect(() => {
    async function getNile() {
      const nile = await Nile({
        basePath: NILE_URL,
        workspace: NILE_WORKSPACE,
      }).connect(
        NILE_WORKSPACE_ACCESS_TOKEN ?? {
          email: NILE_DEVELOPER_EMAIL,
          password: NILE_DEVELOPER_PASSWORD,
        }
      );
      setNile(nile);
    }
    getNile();
  }, [
    NILE_URL,
    NILE_WORKSPACE,
    NILE_WORKSPACE_ACCESS_TOKEN,
    NILE_DEVELOPER_EMAIL,
    NILE_DEVELOPER_PASSWORD,
  ]);

  return _nile;
};
