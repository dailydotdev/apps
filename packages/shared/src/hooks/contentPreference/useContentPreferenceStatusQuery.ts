import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  CONTENT_PREFERENCE_STATUS_QUERY,
  ContentPreference,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { ApiError, ApiErrorResult, gqlClient } from '../../graphql/common';

export type UseContentPreferenceStatusQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  queryOptions?: UseQueryOptions<ContentPreference>;
};

export type UseContentPreferenceStatusQuery = UseQueryResult<ContentPreference>;

export const useContentPreferenceStatusQuery = ({
  id,
  entity,
  queryOptions,
}: UseContentPreferenceStatusQueryProps): UseContentPreferenceStatusQuery => {
  const { user, isLoggedIn } = useAuthContext();
  const enabled = !!(isLoggedIn && id && entity);

  const queryResult = useQuery({
    queryKey: generateQueryKey(RequestKey.ContentPreference, user, {
      id,
      entity,
    }),
    queryFn: async ({ queryKey }) => {
      const [, , queryVariables] = queryKey as [
        unknown,
        unknown,
        { id: string; entity: ContentPreferenceType },
      ];

      try {
        const result = await gqlClient.request<{
          contentPreferenceStatus: ContentPreference;
        }>(CONTENT_PREFERENCE_STATUS_QUERY, queryVariables);

        return result.contentPreferenceStatus;
      } catch (originalError) {
        const error = originalError as ApiErrorResult;
        const errorCode = error.response?.errors?.[0]?.extensions?.code;

        if ([ApiError.NotFound].includes(errorCode)) {
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
