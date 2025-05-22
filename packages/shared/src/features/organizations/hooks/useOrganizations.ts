import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import {
  ORGANIZATION_QUERY,
  ORGANIZATIONS_QUERY,
} from '../../../graphql/organization';
import type { UserOrganization } from '../types';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { useAuthContext } from '../../../contexts/AuthContext';

export const useOrganizations = () => {
  const { user } = useAuthContext();

  const { data: organizations, isFetching } = useQuery({
    queryKey: generateQueryKey(RequestKey.Organizations, user),
    queryFn: async () => {
      const data = await gqlClient.request<{
        organizations: UserOrganization[];
      }>(ORGANIZATIONS_QUERY);

      if (!data || !data.organizations) {
        return [];
      }

      return data.organizations;
    },
    staleTime: StaleTime.Default,
  });

  return { organizations, isFetching };
};

export const useOrganization = (orgId: string) => {
  const { user, isAuthReady } = useAuthContext();
  const enableQuery = !!orgId && !!user && isAuthReady;

  const { data: organization, isFetching } = useQuery({
    queryKey: generateQueryKey(RequestKey.Organizations, user, orgId),
    enabled: enableQuery,
    queryFn: async () => {
      const data = await gqlClient.request<{
        organization: UserOrganization;
      }>(ORGANIZATION_QUERY, { id: orgId });

      if (!data || !data.organization) {
        return null;
      }

      return data.organization;
    },
    staleTime: StaleTime.Default,
  });

  return { organization, isFetching };
};
