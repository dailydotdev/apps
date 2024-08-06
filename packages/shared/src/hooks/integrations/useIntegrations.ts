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

export type UseIntegrationsProps = {
  queryOptions?: UseQueryOptions<UserIntegration[]>;
};

export type UseIntegrations = UseQueryResult<UserIntegration[]>;

export const useIntegrations = ({
  queryOptions,
}: UseIntegrationsProps = {}): UseIntegrations => {
  const { user } = useAuthContext();
  const enabled = !!user;

  const queryResult = useQuery(
    generateQueryKey(RequestKey.UserIntegrations, user),
    async () => {
      const result = await gqlClient.request<{
        userIntegrations: Connection<UserIntegration>;
      }>(USER_INTEGRATIONS);

      return result.userIntegrations.edges.map((edge) => edge.node);
    },
    {
      staleTime: StaleTime.Default,
      ...queryOptions,
      enabled: queryOptions?.enabled
        ? queryOptions.enabled && enabled
        : enabled,
    },
  );

  return queryResult;
};
