import { useQuery } from '@tanstack/react-query';
import type { ApiErrorResult } from '@dailydotdev/shared/src/graphql/common';
import {
  ApiError,
  getApiError,
  gqlClient,
} from '@dailydotdev/shared/src/graphql/common';
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
  WorldSettings,
} from '../../graphql/world';
import {
  USER_WORLD_QUERY,
  USER_WORLD_TIMELINE_QUERY,
} from '../../graphql/world';

export interface UserWorldResult {
  districts?: WorldDistrict[];
  timeline?: WorldGrowth[];
  /** Null once settled: the owner has never customised anything. */
  settings?: WorldSettings | null;
  /** The world can be raised: this is the whole of the critical path. */
  isPending: boolean;
  /** The history is still on the wire. The world stands without it. */
  isHistoryPending: boolean;
  isEmpty: boolean;
  /** Hidden by its owner, and the viewer is not the owner. */
  isPrivate: boolean;
  error?: Error;
}

export const userWorldQueryKey = (userId?: string): unknown[] =>
  generateQueryKey(
    RequestKey.UserWorld,
    userId ? { id: userId } : undefined,
  ) as unknown[];

/**
 * Two queries, not one, and only the small one is waited for.
 *
 * The first is everything the world needs to stand up: at most forty districts
 * and the owner's customisations, batched into a single round trip because
 * neither half can draw without the other — the districts decide what is
 * standing and the settings decide what it is photographed through, so asking
 * separately buys either a frame of the wrong look or a second wait for it.
 *
 * The growth log is the same world's whole history, tens of thousands of rows on
 * a four-year reader, and it is only ever needed to REPLAY the place. So the
 * world is raised off the first query and the log is folded in underneath it
 * when it lands (`attachHistory`), which costs nothing to look at because the
 * day it is folded in on is the world already on screen.
 *
 * The timeline is allowed to fail. The world still stands without it; it simply
 * has no history to walk, which is what `replayable` on the model reports.
 */
export const useUserWorld = (userId?: string): UserWorldResult => {
  const world = useQuery({
    queryKey: userWorldQueryKey(userId),
    queryFn: async () => {
      const res = await gqlClient.request<UserWorldData>(USER_WORLD_QUERY, {
        id: userId,
      });
      return {
        districts: res.userWorld,
        settings: res.userWorldSettings ?? null,
      };
    },
    enabled: !!userId,
    staleTime: StaleTime.Default,
    // A refused world is refused for as long as its owner keeps it that way,
    // and three more round trips do not change the answer.
    retry: false,
  });
  const districts = world.data?.districts;
  const hasDistricts = !!districts?.length;
  /* Not an error to report: a hidden world is a world the viewer is not allowed
     to see rather than one that failed, so it gets its own screen and never
     "this world could not be loaded". */
  const isPrivate = !!getApiError(
    world.error as unknown as ApiErrorResult,
    ApiError.Forbidden,
  );

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
    districts,
    timeline: timeline.data,
    settings: world.data?.settings,
    isPending: world.isPending,
    isHistoryPending: hasDistricts && timeline.isPending,
    isEmpty: world.isSuccess && !hasDistricts,
    isPrivate,
    error: isPrivate ? undefined : (world.error as Error) ?? undefined,
  };
};
