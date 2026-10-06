import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { dmConversationsQueryOptions } from '../queries';

export const useHasUnreadMessages = (enabled: boolean): boolean => {
  const { user } = useAuthContext();
  const { data: conversations } = useQuery({
    ...dmConversationsQueryOptions(user),
    enabled: enabled && !!user?.id,
  });

  return !!conversations?.some(({ unreadCount }) => unreadCount > 0);
};
