import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { dmConversationsQueryOptions } from '../queries';
import { supportsUnreadCounts } from '../transport';

export const useHasUnreadMessages = (enabled: boolean): boolean => {
  const { user } = useAuthContext();
  const { data: conversations } = useQuery({
    ...dmConversationsQueryOptions(user),
    // Real unread counts need the server-side inbox module; until then this
    // would open a chat session on every page just to show nothing.
    enabled: enabled && supportsUnreadCounts && !!user?.id,
  });

  return !!conversations?.some(({ unreadCount }) => unreadCount > 0);
};
