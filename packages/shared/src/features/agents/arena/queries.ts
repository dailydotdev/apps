import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import type { ArenaGroupId, ArenaQueryResponse } from './types';
import { ARENA_QUERY } from './graphql';
import { ARENA_GROUP_IDS } from './config';

const ARENA_REFETCH_INTERVAL = 60_000;

export const arenaOptions = ({ groupId }: { groupId: ArenaGroupId }) => ({
  queryKey: generateQueryKey(RequestKey.Arena, undefined, groupId),
  queryFn: async () => {
    const res = await gqlClient.request<ArenaQueryResponse>(ARENA_QUERY, {
      groupId: ARENA_GROUP_IDS[groupId],
      lookback: '7d',
      resolution: 'HOUR',
      highlightsFirst: 50,
      highlightsOrderBy: 'RECENCY',
    });
    return res;
  },
  staleTime: StaleTime.Base,
  refetchInterval: ARENA_REFETCH_INTERVAL,
  refetchIntervalInBackground: false,
});
