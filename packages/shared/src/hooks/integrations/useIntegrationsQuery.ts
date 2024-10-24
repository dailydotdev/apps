import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { UserIntegration } from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { gqlClient, Connection } from '../../graphql/common';
import { USER_INTEGRATIONS } from '../../graphql/users';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseIntegrationsQueryProps = {
  queryOptions?: UseQueryOptions<UserIntegration[]>;
};

export type UseIntegrationsQuery = UseQueryResult<UserIntegration[]>;

export const useIntegrationsQuery = ({
  queryOptions,
}: UseIntegrationsQueryProps = {}): UseIntegrationsQuery => {
  const { user } = useAuthContext();
  const enabled = !!user;

  const queryResult = useQuery({
    queryKey: generateQueryKey(RequestKey.UserIntegrations, user),

    queryFn: async () => {
      const result = await gqlClient.request<{
        userIntegrations: Connection<UserIntegration>;
      }>(USER_INTEGRATIONS);

      return result.userIntegrations.edges.map((edge) => edge.node);
    },
    staleTime: StaleTime.Default,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  return queryResult;
};
