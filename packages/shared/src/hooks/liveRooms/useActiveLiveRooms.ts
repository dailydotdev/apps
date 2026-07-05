import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  ACTIVE_LIVE_ROOMS_QUERY,
  type ActiveLiveRoom,
  type ActiveLiveRoomsData,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';

interface UseActiveLiveRoomsProps {
  enabled: boolean;
  limit?: number;
}

export const useActiveLiveRooms = ({
  enabled,
  limit = 5,
}: UseActiveLiveRoomsProps): UseQueryResult<ActiveLiveRoom[]> => {
  return useQuery<ActiveLiveRoom[]>({
    queryKey: generateQueryKey(
      RequestKey.LiveRooms,
      undefined,
      'active',
      limit,
    ),
    queryFn: async () => {
      const data = await gqlClient.request<ActiveLiveRoomsData>(
        ACTIVE_LIVE_ROOMS_QUERY,
        { limit },
      );
      return data.activeLiveRooms;
    },
    enabled,
    staleTime: ONE_MINUTE / 2,
  });
};
