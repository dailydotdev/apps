import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type {
  UserIntegrationType,
  UserSourceIntegration,
} from '../../graphql/integrations';
import { SOURCE_INTEGRATION_QUERY } from '../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';

export type UseSourceIntegrationQueryProps = {
  userIntegrationType: UserIntegrationType;
  sourceId: string;
  queryOptions?: UseQueryOptions<UserSourceIntegration>;
};

export type UseSourceIntegrationQuery = UseQueryResult<UserSourceIntegration>;

export const useSourceIntegrationQuery = ({
  userIntegrationType,
  sourceId,
  queryOptions,
}: UseSourceIntegrationQueryProps): UseSourceIntegrationQuery => {
  const { user } = useAuthContext();
  const enabled = !!(userIntegrationType && sourceId);

  const queryResult = useQuery({
    queryKey: generateQueryKey(RequestKey.UserSourceIntegrations, user, {
      sourceId,
      userIntegrationType,
    }),
    queryFn: async ({ queryKey }) => {
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

        if ([ApiError.NotFound, ApiError.Forbidden].includes(errorCode)) {
          return null;
        }

        throw originalError;
      }
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
