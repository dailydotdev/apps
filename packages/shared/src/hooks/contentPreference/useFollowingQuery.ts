import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import {
  ContentPreference,
  ContentPreferenceType,
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
import { Connection, gqlClient } from '../../graphql/common';
import { useFollowContentPreferenceMutationSubscription } from './useFollowContentPreferenceMutationSubscription';

export type UseFollowingQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  limit?: number;
  queryOptions?: Omit<
    UseInfiniteQueryOptions<Connection<ContentPreference>>,
    'select'
  >;
};

export const useFollowingQuery = ({
  id,
  entity,
  limit = DEFAULT_FOLLOW_LIMIT,
  queryOptions,
}: UseFollowingQueryProps) => {
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
    },
  );

  const queryResult = useInfiniteQuery({
    queryKey,
    queryFn: async ({ queryKey: queryKeyArg, pageParam }) => {
      const [, , , queryVariables] = queryKeyArg as [
        unknown,
        unknown,
        unknown,
        { id: string; entity: ContentPreferenceType },
      ];
      const result = await gqlClient.request(USER_FOLLOWING_QUERY, {
        ...queryVariables,
        after: pageParam,
      });

      return result.userFollowing;
    },
    initialPageParam: '',
    staleTime: StaleTime.Default,
    getNextPageParam: ({ lastPage }) => getNextPageParam(lastPage?.pageInfo),
    ...queryOptions,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  useFollowContentPreferenceMutationSubscription({ queryKey });

  return queryResult;
};
