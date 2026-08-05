import { useState } from 'react';
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
import { isHandheld } from './worldDevice';

export interface UserWorldResult {
  districts?: WorldDistrict[];
  timeline?: WorldGrowth[];
  /** Null once settled: the owner has never customised anything. */
  settings?: WorldSettings | null;
  /** The world can be raised: this is the whole of the critical path. */
  isPending: boolean;
  /** The history is still on the wire. The world stands without it, and it is
      never on the wire at all where there is no scrubber to drive with it. */
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
 * Districts+settings in one blocking round trip; the heavy growth log loads
 * behind the standing world and may fail without taking it down.
 *
 * On a handheld the log is not asked for at all. It is by far the largest
 * response this page takes — one row per day of reading, for years of it — and
 * the only thing that reads it is the scrubber, which is not on screen there.
 * Fetching it anyway would spend a phone's data and a phone's parse on a replay
 * nobody can start.
 */
export const useUserWorld = (userId?: string): UserWorldResult => {
  const [withHistory] = useState(() => !isHandheld());
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
    // A refused world stays refused, so FORBIDDEN skips the usual retries.
    retry: (failureCount, retryError) =>
      getApiError(retryError as unknown as ApiErrorResult, ApiError.Forbidden)
        ? false
        : failureCount < 3,
  });
  const districts = world.data?.districts;
  const hasDistricts = !!districts?.length;
  /* Not an error to report: a hidden world gets its own screen, never
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
    enabled: !!userId && hasDistricts && withHistory,
    staleTime: StaleTime.Default,
  });

  return {
    districts,
    timeline: timeline.data,
    settings: world.data?.settings,
    isPending: world.isPending,
    /* A disabled query reports itself as pending forever, which would leave the
       scrubber's placeholder holding a place nothing is ever going to fill. */
    isHistoryPending: withHistory && hasDistricts && timeline.isPending,
    isEmpty: world.isSuccess && !hasDistricts,
    isPrivate,
    error: isPrivate ? undefined : (world.error as Error) ?? undefined,
  };
};
