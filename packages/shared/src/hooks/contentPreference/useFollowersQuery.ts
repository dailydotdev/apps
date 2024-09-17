import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  ContentPreference,
  ContentPreferenceType,
  USER_FOLLOWERS_QUERY,
} from '../../graphql/contentPreference';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { Connection, gqlClient } from '../../graphql/common';

export type UseFollowersQueryProps = {
  id: string;
  entity: ContentPreferenceType;
  queryOptions?: UseInfiniteQueryOptions<Connection<ContentPreference>>;
};

export type UseFollowersQuery = UseInfiniteQueryResult<
  Connection<ContentPreference>
>;

export const useFollowersQuery = ({
  id,
  entity,
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
      },
    ),
    async ({ queryKey }) => {
      const [, , , queryVariables] = queryKey as [
        unknown,
        unknown,
        unknown,
        { id: string; entity: ContentPreferenceType },
      ];
      const result = await gqlClient.request<{
        userFollowers: Connection<ContentPreference>;
      }>(USER_FOLLOWERS_QUERY, queryVariables);

      return result.userFollowers;
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
