import { CreatePolicyRequest, Action, User } from "@theniledev/js";
import { useMutation, useNile } from "@theniledev/react";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const { NILE_ENTITY_NAME } = publicRuntimeConfig;

export const ADMIN = 'admin';
export const READ_WRITE = 'RW';
export const READ_ONLY = 'RO';

export const checkAccess = (user: void | User) => {
  const { role } = (user?.metadata ?? {}) as Record<string, any>;
  return role === ADMIN || role === READ_WRITE
}

const AdminRole: CreatePolicyRequest = {
  subject: {
    metadata: {
      role: ADMIN 
    }
  },
  resource: {
    type: NILE_ENTITY_NAME
  },
  actions: new Set([Action.Read, Action.Write]),
};

const ReadOnly: CreatePolicyRequest = {
  subject: {
    metadata: {
      role: READ_ONLY 
    }
  },
  resource: {
    type: NILE_ENTITY_NAME
  },
  actions: new Set([Action.Read]),
}

const ReadWrite: CreatePolicyRequest = {
  subject: {
    metadata: {
      role: READ_WRITE
    }
  },
  resource: {
    type: NILE_ENTITY_NAME
  },
  actions: new Set([Action.Read, Action.Write]),
}

const Denied: CreatePolicyRequest = {
  subject: {},
  resource: {
    type: NILE_ENTITY_NAME
  },
  actions: new Set([Action.Deny]),
}

export function useAddOrgPolicy() {
  const nile = useNile();

  const adminRole = useMutation((org: string) => 
    nile.access.createPolicy({
      org,
      createPolicyRequest: AdminRole
    })
  );

  const readOnly = useMutation((org: string) => 
    nile.access.createPolicy({
      org,
      createPolicyRequest: ReadOnly
    })
  );
  
  const readWrite = useMutation((org: string) => 
    nile.access.createPolicy({
      org,
      createPolicyRequest: ReadWrite 
    })
  );

  const denied = useMutation((org: string) => 
    nile.access.createPolicy({
      org,
      createPolicyRequest: Denied
    })
  );
  
  return async(orgId: string) => {
    const requests = await Promise.all([
      adminRole.mutate(orgId),
      readOnly.mutate(orgId),
      readWrite.mutate(orgId),
      denied.mutate(orgId)
    ]);
    console.log(requests);
  }
}