/**
 * This is a stop gap for some functionality that exists.
 * Ideally, this is not needed since other parts of the architecture would handle
 * the `developer` like things that need done.
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
    NILE_DEVELOPER_EMAIL,
    NILE_DEVELOPER_PASSWORD
  } = publicRuntimeConfig;


  React.useEffect(() => {
    async function getNile() {
      const nile = await Nile({ 
        basePath: NILE_URL, 
        workspace: NILE_WORKSPACE 
      }).connect({ 
        email: NILE_DEVELOPER_EMAIL, 
        password: NILE_DEVELOPER_PASSWORD
      });
      setNile(nile);
    }
    getNile();
  }, [NILE_DEVELOPER_EMAIL, NILE_DEVELOPER_PASSWORD, NILE_URL, NILE_WORKSPACE]);

  return _nile;
}