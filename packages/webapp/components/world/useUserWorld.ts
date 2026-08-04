import { useQuery } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  generateQueryKey,
  RequestKey,
  StaleTime,
} from '@dailydotdev/shared/src/lib/query';
import type {
  UserWorldData,
  UserWorldTimelineData,
  WorldDistrict,
  WorldGrowth,
} from '../../graphql/world';
import {
  USER_WORLD_QUERY,
  USER_WORLD_TIMELINE_QUERY,
} from '../../graphql/world';

export interface UserWorldResult {
  districts?: WorldDistrict[];
  timeline?: WorldGrowth[];
  /** The world can be raised: this is the whole of the critical path. */
  isPending: boolean;
  /** The history is still on the wire. The world stands without it. */
  isHistoryPending: boolean;
  isEmpty: boolean;
  error?: Error;
}

/**
 * Two queries, not one, and only the small one is waited for.
 *
 * The districts are at most forty rows and they are everything the world needs
 * to stand up: the layout packs islands by lifetime totals, and those are on
 * this query. The growth log is the same world's whole history, tens of
 * thousands of rows on a four-year reader, and it is only ever needed to REPLAY
 * the place. So the world is raised off the districts and the log is folded in
 * underneath it when it lands (`attachHistory`), which costs nothing to look at
 * because the day it is folded in on is the world already on screen.
 *
 * The timeline is allowed to fail. The world still stands without it; it simply
 * has no history to walk, which is what `replayable` on the model reports.
 */
export const useUserWorld = (userId?: string): UserWorldResult => {
  const districts = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserWorld,
      userId ? { id: userId } : undefined,
    ),
    queryFn: async () => {
      const res = await gqlClient.request<UserWorldData>(USER_WORLD_QUERY, {
        id: userId,
      });
      return res.userWorld;
    },
    enabled: !!userId,
    staleTime: StaleTime.Default,
  });
  const hasDistricts = !!districts.data?.length;

  const timeline = useQuery({
    queryKey: generateQueryKey(
      RequestKey.UserWorldTimeline,
      userId ? { id: userId } : undefined,
    ),
    queryFn: async () => {
      const res = await gqlClient.request<UserWorldTimelineData>(
        USER_WORLD_TIMELINE_QUERY,
        { id: userId },
      );
      return res.userWorldTimeline;
    },
    // A world with no districts has no history worth asking for.
    enabled: !!userId && hasDistricts,
    staleTime: StaleTime.Default,
  });

  return {
    districts: districts.data,
    timeline: timeline.data,
    isPending: districts.isPending,
    isHistoryPending: hasDistricts && timeline.isPending,
    isEmpty: districts.isSuccess && !hasDistricts,
    error: (districts.error as Error) ?? undefined,
  };
};
