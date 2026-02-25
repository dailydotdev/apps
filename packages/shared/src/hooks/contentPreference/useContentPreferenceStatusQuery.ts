import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type {
  ContentPreference,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import { CONTENT_PREFERENCE_STATUS_QUERY } from '../../graphql/contentPreference';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { ApiErrorResult } from '../../graphql/common';
import { ApiError, gqlClient } from '../../graphql/common';
import { useMutationSubscription } from '../mutationSubscription/useMutationSubscription';
import type { ContentPreferenceMutation } from './types';
import {
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './types';

export type UseContentPreferenceStatusQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  queryOptions?: Partial<
    Omit<UseQueryOptions<ContentPreference | undefined>, 'queryKey' | 'queryFn'>
  >;
};

export type UseContentPreferenceStatusQuery = UseQueryResult<
  ContentPreference | undefined
>;

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

  const queryResult = useQuery<ContentPreference | undefined>({
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
          return undefined;
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
        mutationVariables as Parameters<ContentPreferenceMutation>[0];

      if (entityId !== id || entityType !== entity) {
        return;
      }

      const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

      if (typeof nextStatus === 'undefined' || nextStatus === null) {
        mutationQueryClient.setQueryData<ContentPreference | undefined>(
          queryKey,
          undefined,
        );

        return;
      }

      mutationQueryClient.setQueryData<ContentPreference | undefined>(
        queryKey,
        {
          status: nextStatus,
          referenceId: entityId,
          type: entityType,
          createdAt: new Date(),
        },
      );
    },
  });

  return queryResult;
};
