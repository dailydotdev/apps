import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SUBSCRIBE_TO_LIVE_ROOM_MUTATION,
  UNSUBSCRIBE_FROM_LIVE_ROOM_MUTATION,
  type SubscribeToLiveRoomData,
  type UnsubscribeFromLiveRoomData,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { generateQueryKey, RequestKey } from '../../lib/query';

export const useLiveRoomSubscription = (roomId: string) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const detailKey = generateQueryKey(
    RequestKey.LiveRooms,
    user,
    'detail',
    roomId,
  );

  const invalidateRooms = async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: detailKey });
  };

  const subscribe = useMutation({
    mutationFn: async () => {
      const data = await gqlClient.request<SubscribeToLiveRoomData>(
        SUBSCRIBE_TO_LIVE_ROOM_MUTATION,
        { roomId },
      );
      return data.subscribeToLiveRoom;
    },
    onSuccess: invalidateRooms,
  });

  const unsubscribe = useMutation({
    mutationFn: async () => {
      const data = await gqlClient.request<UnsubscribeFromLiveRoomData>(
        UNSUBSCRIBE_FROM_LIVE_ROOM_MUTATION,
        { roomId },
      );
      return data.unsubscribeFromLiveRoom;
    },
    onSuccess: invalidateRooms,
  });

  return { subscribe, unsubscribe };
};
