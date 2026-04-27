import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  ACTIVE_LIVE_ROOMS_QUERY,
  type ActiveLiveRoomsData,
  type LiveRoom,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';

export const getActiveLiveRoomsKey = (
  user?: { id: string } | null,
): ReturnType<typeof generateQueryKey> =>
  generateQueryKey(RequestKey.LiveRooms, user ?? undefined, 'active');

export const useActiveLiveRooms = (): UseQueryResult<LiveRoom[]> => {
  const { user } = useAuthContext();

  return useQuery<LiveRoom[]>({
    queryKey: getActiveLiveRoomsKey(user),
    queryFn: async () => {
      const data = await gqlClient.request<ActiveLiveRoomsData>(
        ACTIVE_LIVE_ROOMS_QUERY,
      );
      return data.activeLiveRooms;
    },
    enabled: !!user,
    staleTime: ONE_MINUTE,
    refetchInterval: ONE_MINUTE,
  });
};
