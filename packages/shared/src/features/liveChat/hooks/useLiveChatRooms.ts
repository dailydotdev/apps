import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { ChatRoom, PostChatRoom } from '../graphql';
import { liveChatRoomsQueryOptions } from '../queries';
import { useLiveChatEnabled } from './useLiveChatEnabled';

type UseLiveChatRooms = {
  rooms: ChatRoom[];
  // Still finding out, for a surface that reserves the room's space.
  isPending: boolean;
};

// Every open room, from the one small query the feed surfaces share. Only
// trending posts get rooms, so there are never more than a handful, and a
// reader outside live chat never asks.
export const useLiveChatRooms = (): UseLiveChatRooms => {
  const { user } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  const isOn = isEnabled && !!user?.id;
  const { data: rooms = [], isPending } = useQuery({
    ...liveChatRoomsQueryOptions(user),
    enabled: isOn,
  });

  return { rooms: isOn ? rooms : [], isPending: isOn && isPending };
};

// The open room on a post, for the card's label; null outside live chat, so
// a reader who can't join never sees "Live".
export const useLiveChatRoomOf = (postId?: string): PostChatRoom | null => {
  const { rooms } = useLiveChatRooms();
  if (!postId) {
    return null;
  }

  return rooms.find((room) => room.post?.id === postId) ?? null;
};
