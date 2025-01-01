import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type {
  UserIntegrationType,
  UserSourceIntegration,
} from '../../graphql/integrations';
import { SOURCE_INTEGRATIONS_QUERY } from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseSourceIntegrationsQueryProps = {
  integrationId: string;
  queryOptions?: UseQueryOptions<UserSourceIntegration[]>;
};

export type UseSourceIntegrationsQuery = UseQueryResult<
  UserSourceIntegration[]
>;

export const useSourceIntegrationsQuery = ({
  integrationId,
  queryOptions,
}: UseSourceIntegrationsQueryProps): UseSourceIntegrationsQuery => {
  const { user } = useAuthContext();
  const enabled = !!integrationId;

  const queryResult = useQuery({
    queryKey: generateQueryKey(RequestKey.UserSourceIntegrations, user, {
      integrationId,
    }),
    queryFn: async ({ queryKey }) => {
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
    staleTime: StaleTime.Default,
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  return queryResult;
};
