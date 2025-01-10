import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type {
  ContentPreference,
  ContentPreferenceType,
} from '../../graphql/contentPreference';
import {
  DEFAULT_FOLLOW_LIMIT,
  USER_FOLLOWING_QUERY,
} from '../../graphql/contentPreference';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import type { Connection } from '../../graphql/common';
import { gqlClient } from '../../graphql/common';
import { useFollowContentPreferenceMutationSubscription } from './useFollowContentPreferenceMutationSubscription';

export type UseFollowingQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  feedId?: string;
  limit?: number;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<Connection<ContentPreference>>,
    'select'
  >;
};

export type UseFollowingQuery = UseInfiniteQueryResult<
  InfiniteData<Connection<ContentPreference>>
>;

export const useFollowingQuery = ({
  id,
  entity,
  feedId,
  limit = DEFAULT_FOLLOW_LIMIT,
  queryOptions,
}: UseFollowingQueryProps): UseFollowingQuery => {
  const { user } = useAuthContext();
  const enabled = !!(id && entity);
  const queryKey = generateQueryKey(
    RequestKey.ContentPreference,
    user,
    RequestKey.UserFollowing,
    {
      id,
      entity,
      first: limit,
      feedId,
    },
  );

  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: async ({ queryKey: queryKeyArg, pageParam }) => {
      const [, , , queryVariables] = queryKeyArg as [
        unknown,
        unknown,
        unknown,
        { id: string; entity: ContentPreferenceType; feedId: string },
      ];
      const result = await gqlClient.request(USER_FOLLOWING_QUERY, {
        ...queryVariables,
        after: pageParam,
      });

      return result.userFollowing;
    },
    initialPageParam: '',
    staleTime: StaleTime.Default,
    getNextPageParam: ({ pageInfo }) => getNextPageParam(pageInfo),
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  useFollowContentPreferenceMutationSubscription({ queryKey });

  return queryResult;
};
