import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import {
  LIVE_ROOM_QUERY,
  type LiveRoom,
  type LiveRoomData,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { ONE_MINUTE } from '../../lib/time';

export const useLiveRoom = (
  roomId: string | undefined,
): UseQueryResult<LiveRoom> => {
  const { user } = useAuthContext();
  return useQuery<LiveRoom>({
    queryKey: generateQueryKey(RequestKey.LiveRooms, user, 'detail', roomId),
    queryFn: async () => {
      const data = await gqlClient.request<LiveRoomData>(LIVE_ROOM_QUERY, {
        id: roomId,
      });
      return data.liveRoom;
    },
    enabled: !!roomId,
    staleTime: ONE_MINUTE,
  });
};
