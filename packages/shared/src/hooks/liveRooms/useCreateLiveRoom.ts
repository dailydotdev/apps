import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CREATE_LIVE_ROOM_MUTATION,
  type CreateLiveRoomData,
  type LiveRoomJoinToken,
  LiveRoomMode,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';
import { useAuthContext } from '../../contexts/AuthContext';
import { getActiveLiveRoomsKey } from './useActiveLiveRooms';

export interface CreateLiveRoomInput {
  topic: string;
  mode?: LiveRoomMode;
}

export const useCreateLiveRoom = () => {
  const { user } = useAuthContext();
  const client = useQueryClient();

  return useMutation<LiveRoomJoinToken, Error, CreateLiveRoomInput>({
    mutationFn: async (input) => {
      const data = await gqlClient.request<CreateLiveRoomData>(
        CREATE_LIVE_ROOM_MUTATION,
        {
          input: {
            topic: input.topic,
            mode: input.mode ?? LiveRoomMode.Debate,
          },
        },
      );
      return data.createLiveRoom;
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: getActiveLiveRoomsKey(user) });
    },
  });
};
