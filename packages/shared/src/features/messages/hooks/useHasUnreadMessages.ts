import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import {
  dmConversationsQueryOptions,
  dmRequestCountQueryOptions,
} from '../queries';
import { supportsUnreadCounts } from '../transport';

export const useHasUnreadMessages = (enabled: boolean): boolean => {
  const { user } = useAuthContext();
  const { isSettled } = useShellState();
  const { data: conversations } = useQuery({
    ...dmConversationsQueryOptions(user),
    // Real unread counts need the server-side inbox module; until then this
    // would open a chat session on every page just to show nothing.
    enabled: enabled && supportsUnreadCounts && !!user?.id,
  });
  // The shell state query seeds the count; this only fetches as a fallback.
  const { data: requestCount = 0 } = useQuery({
    ...dmRequestCountQueryOptions(user),
    enabled: enabled && isSettled && !!user?.id,
  });

  return (
    requestCount > 0 ||
    !!conversations?.some(({ unreadCount }) => unreadCount > 0)
  );
};
