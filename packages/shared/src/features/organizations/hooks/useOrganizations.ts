import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../../graphql/common';
import { ORGANIZATIONS_QUERY } from '../../../graphql/organization';
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
