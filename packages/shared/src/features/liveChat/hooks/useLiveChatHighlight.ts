import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import type { ChatRoom } from '../graphql';
import { liveChatRoomsQueryOptions } from '../queries';
import { useLiveChatEnabled } from './useLiveChatEnabled';

// The one room worth a line on the feed: the newest open one, since only a
// handful of posts trend at a time and the newest is the one taking off.
export const useLiveChatHighlight = (): ChatRoom | null => {
  const { user } = useAuthContext();
  const { isEnabled } = useLiveChatEnabled();
  const { data: rooms } = useQuery({
    ...liveChatRoomsQueryOptions(user),
    enabled: isEnabled && !!user?.id,
  });

  return rooms?.find((room) => room.post?.commentsPermalink) ?? null;
};
