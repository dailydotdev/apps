import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '../../graphql/common';
import type { UserFollowStats } from '../../graphql/users';
import { USER_FOLLOW_STATS_QUERY } from '../../graphql/users';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';

export const userFollowStatsQueryOptions = (userId?: string) => ({
  queryKey: generateQueryKey(RequestKey.UserFollowStats, { id: userId ?? '' }),
  queryFn: async () => {
    const data = await gqlClient.request<{ userStats: UserFollowStats }>(
      USER_FOLLOW_STATS_QUERY,
      { id: userId },
    );
    return data.userStats;
  },
  staleTime: StaleTime.OneMinute,
});

export const useUserFollowStats = (userId?: string) =>
  useQuery({ ...userFollowStatsQueryOptions(userId), enabled: !!userId });
