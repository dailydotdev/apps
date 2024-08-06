import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  SOURCE_INTEGRATIONS_QUERY,
  UserIntegrationType,
  UserSourceIntegration,
} from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { Connection, gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseSourceIntegrationsProps = {
  integrationId: string;
  queryOptions?: UseQueryOptions<UserSourceIntegration[]>;
};

export type UseSourceIntegrations = UseQueryResult<UserSourceIntegration[]>;

export const useSourceIntegrations = ({
  integrationId,
  queryOptions,
}: UseSourceIntegrationsProps): UseSourceIntegrations => {
  const { user } = useAuthContext();
  const enabled = !!integrationId;

  const queryResult = useQuery(
    generateQueryKey(RequestKey.UserSourceIntegrations, user, {
      integrationId,
    }),
    async ({ queryKey }) => {
      const [, , queryVariables] = queryKey as [
        unknown,
        unknown,
        { sourceId: string; userIntegrationType: UserIntegrationType },
      ];
      const result = await gqlClient.request<{
        sourceIntegrations: Connection<UserSourceIntegration>;
      }>(SOURCE_INTEGRATIONS_QUERY, queryVariables);

      return result.sourceIntegrations.edges.map((edge) => edge.node);
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
