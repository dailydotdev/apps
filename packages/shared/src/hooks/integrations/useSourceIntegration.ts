import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  SOURCE_INTEGRATION_QUERY,
  UserIntegrationType,
  UserSourceIntegration,
} from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { ApiError, ApiErrorResult, gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseSourceIntegrationProps = {
  userIntegrationType: UserIntegrationType;
  sourceId: string;
  queryOptions?: UseQueryOptions<UserSourceIntegration>;
};

export type UseSourceIntegration = UseQueryResult<UserSourceIntegration>;

export const useSourceIntegration = ({
  userIntegrationType,
  sourceId,
  queryOptions,
}: UseSourceIntegrationProps): UseSourceIntegration => {
  const { user } = useAuthContext();
  const enabled = !!(userIntegrationType && sourceId);

  const queryResult = useQuery(
    generateQueryKey(RequestKey.UserSourceIntegrations, user, {
      sourceId,
      userIntegrationType,
    }),
    async ({ queryKey }) => {
      const [, , queryVariables] = queryKey as [
        unknown,
        unknown,
        { sourceId: string; userIntegrationType: UserIntegrationType },
      ];

      try {
        const result = await gqlClient.request<{
          sourceIntegration: UserSourceIntegration;
        }>(SOURCE_INTEGRATION_QUERY, queryVariables);

        return result.sourceIntegration;
      } catch (originalError) {
        const error = originalError as ApiErrorResult;
        const errorCode = error.response?.errors?.[0]?.extensions?.code;

        if (errorCode === ApiError.NotFound) {
          return null;
        }

        throw originalError;
      }
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
