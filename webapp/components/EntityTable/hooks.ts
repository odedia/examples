import React from 'react';
import { Organization, User } from '@theniledev/js';
import { useQuery, useNile } from '@theniledev/react';

export const useFirstOrg = (): [
  boolean,
  User | undefined,
  Organization | undefined,
  boolean
] => {
  const nile = useNile();
  const {
    isLoading,
    data: user,
    error,
  } = useQuery(['/me'], () => nile.users.me());

  const _error: { response: { status: number } } = error as any;
  const errorStatus = _error ? _error?.response?.status : null;
  const unauthorized = errorStatus === 401;

  const { orgMemberships } = user ?? {};

  const theFirstOne = React.useMemo(() => {
    if (orgMemberships) {
      const ids = Object.keys(orgMemberships);
      return ids[0];
    }
  }, [orgMemberships]);

  const { isLoading: orgLoading, data: org } = useQuery(
    ['/orgs'],
    () => nile.organizations.getOrganization({ org: String(theFirstOne) }),
    { enabled: !!theFirstOne }
  );
  return [isLoading && orgLoading, user, org, unauthorized];
};
