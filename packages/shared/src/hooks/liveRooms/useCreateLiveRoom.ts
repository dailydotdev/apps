import { useMutation } from '@tanstack/react-query';
import {
  CREATE_LIVE_ROOM_MUTATION,
  type CreateLiveRoomData,
  type LiveRoomJoinToken,
  LiveRoomMode,
} from '../../graphql/liveRooms';
import { gqlClient } from '../../graphql/common';

export interface CreateLiveRoomInput {
  topic: string;
  mode?: LiveRoomMode;
  speakerLimit?: number;
  scheduledStart?: string;
  description?: string;
}

export const useCreateLiveRoom = () => {
  return useMutation<LiveRoomJoinToken, Error, CreateLiveRoomInput>({
    mutationFn: async (input) => {
      const data = await gqlClient.request<CreateLiveRoomData>(
        CREATE_LIVE_ROOM_MUTATION,
        {
          input: {
            topic: input.topic,
            mode: input.mode ?? LiveRoomMode.Moderated,
            speakerLimit: input.speakerLimit,
            scheduledStart: input.scheduledStart,
            description: input.description,
          },
        },
      );
      return data.createLiveRoom;
    },
  });
};
