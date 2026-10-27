import type { ChatRoom } from '../graphql';
import { useLiveChatRooms } from './useLiveChatRooms';

// The one room worth a line on the feed: the newest open one, since only a
// handful of posts trend at a time and the newest is the one taking off.
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
