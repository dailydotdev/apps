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
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './types';
import { PropsParameters } from '../../types';

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
  const queryKey = generateQueryKey(RequestKey.ContentPreference, user, {
    id,
    entity,
  });

  const queryResult = useQuery({
    queryKey,
    queryFn: async ({ queryKey: fnQueryKey }) => {
      const [, , queryVariables] = fnQueryKey as [
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

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({
      mutation,
      queryClient: mutationQueryClient,
      variables: mutationVariables,
    }) => {
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      const { id: entityId, entity: entityType } =
        mutationVariables as PropsParameters<ContentPreferenceMutation>;

      if (entityId !== id || entityType !== entity) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      if (!nextStatus) {
        mutationQueryClient.setQueryData<ContentPreference>(queryKey, null);

        return;
      }

      mutationQueryClient.setQueryData<ContentPreference>(queryKey, {
        status: nextStatus,
        referenceId: entityId,
        type: entityType,
        createdAt: new Date(),
      });
    },
  });

  return queryResult;
};
