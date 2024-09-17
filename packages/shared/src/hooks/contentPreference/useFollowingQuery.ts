import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  ContentPreference,
  ContentPreferenceType,
  DEFAULT_FOLLOW_LIMIT,
  USER_FOLLOWING_QUERY,
} from '../../graphql/contentPreference';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { Connection, gqlClient } from '../../graphql/common';

export type UseFollowingQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  limit?: number;
  queryOptions?: UseInfiniteQueryOptions<Connection<ContentPreference>>;
};

export type UseFollowingQuery = UseInfiniteQueryResult<
  Connection<ContentPreference>
>;

export const useFollowingQuery = ({
  id,
  entity,
  limit = DEFAULT_FOLLOW_LIMIT,
  queryOptions,
}: UseFollowingQueryProps): UseFollowingQuery => {
  const { user } = useAuthContext();
  const enabled = !!(id && entity);

  const queryResult = useInfiniteQuery(
    generateQueryKey(
      RequestKey.ContentPreference,
      user,
      RequestKey.UserFollowing,
      {
        id,
        entity,
        first: limit,
      },
    ),
    async ({ queryKey, pageParam }) => {
      const [, , , queryVariables] = queryKey as [
        unknown,
        unknown,
        unknown,
        { id: string; entity: ContentPreferenceType },
      ];
      const result = await gqlClient.request<{
        userFollowing: Connection<ContentPreference>;
      }>(USER_FOLLOWING_QUERY, {
        ...queryVariables,
        after: pageParam,
      });

      return result.userFollowing;
    },
    {
      staleTime: StaleTime.Default,
      getNextPageParam: (lastPage) =>
        lastPage?.pageInfo?.hasNextPage && lastPage?.pageInfo?.endCursor,
      ...queryOptions,
      enabled:
        typeof queryOptions?.enabled !== 'undefined'
          ? queryOptions.enabled && enabled
          : enabled,
    },
  );

  return queryResult;
};
