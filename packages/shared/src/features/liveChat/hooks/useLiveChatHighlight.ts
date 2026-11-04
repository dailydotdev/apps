import type { ChatRoom } from '../graphql';
import { useLiveChatRooms } from './useLiveChatRooms';

// The one room worth a line on the feed: the newest open one, since the
// team opens only a handful and the newest is the one just getting going.
export const useLiveChatHighlight = (): {
  room: ChatRoom | null;
  isPending: boolean;
} => {
  const { rooms, isPending } = useLiveChatRooms();

  return {
    room: rooms.find((room) => room.post?.commentsPermalink) ?? null,
    isPending,
  };
};
