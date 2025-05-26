import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import { ORGANIZATION_QUERY } from '../../../graphql/organization';
import type { UserOrganization } from '../types';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

export const useOrganization = (orgId: string) => {
  const { user, isAuthReady } = useAuthContext();
  const enableQuery = !!orgId && !!user && isAuthReady;
  const queryKey = generateQueryKey(RequestKey.Organizations, user, orgId);

  const { data, isFetching } = useQuery({
    queryKey,
    enabled: enableQuery,
    queryFn: async () => {
      const res = await gqlClient.request<{
        organization: UserOrganization;
      }>(ORGANIZATION_QUERY, { id: orgId });

      if (!res || !res.organization) {
        return null;
      }

      return res.organization;
    },
    staleTime: StaleTime.Default,
  });

  const { organization, role, referralToken } = data || {};

  return {
    organization,
    role,
    referralToken,
    isFetching,
  };
};
