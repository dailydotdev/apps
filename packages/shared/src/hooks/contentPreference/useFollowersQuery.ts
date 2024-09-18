import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  ContentPreference,
  ContentPreferenceType,
  DEFAULT_FOLLOW_LIMIT,
  USER_FOLLOWERS_QUERY,
} from '../../graphql/contentPreference';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { Connection, gqlClient } from '../../graphql/common';

export type UseFollowersQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  limit?: number;
  queryOptions?: UseInfiniteQueryOptions<Connection<ContentPreference>>;
};

export type UseFollowersQuery = UseInfiniteQueryResult<
  Connection<ContentPreference>
>;

export const useFollowersQuery = ({
  id,
  entity,
  limit = DEFAULT_FOLLOW_LIMIT,
  queryOptions,
}: UseFollowersQueryProps): UseFollowersQuery => {
  const { user } = useAuthContext();
  const enabled = !!(id && entity);

  const queryResult = useInfiniteQuery(
    generateQueryKey(
      RequestKey.ContentPreference,
      user,
      RequestKey.UserFollowers,
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
        userFollowers: Connection<ContentPreference>;
      }>(USER_FOLLOWERS_QUERY, {
        ...queryVariables,
        after: pageParam,
      });

      return result.userFollowers;
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
