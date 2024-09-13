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
import { ApiError, ApiErrorResult, gqlRequest } from '../../graphql/common';
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
        const result = await gqlRequest<{
          sourceIntegration: UserSourceIntegration;
        }>(SOURCE_INTEGRATION_QUERY, queryVariables);

        return result.sourceIntegration;
      } catch (originalError) {
        const error = originalError as ApiErrorResult;
        const errorCode = error.response?.errors?.[0]?.extensions?.code;

        if ([ApiError.NotFound, ApiError.Forbidden].includes(errorCode)) {
          return undefined;
        }

        throw originalError;
      }
    },
    {
      staleTime: StaleTime.Default,
      ...queryOptions,
      enabled:
        typeof queryOptions?.enabled !== 'undefined'
          ? queryOptions.enabled && enabled
          : enabled,
    },
  );

  return queryResult;
};
