import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import {
  dmRequestCountQueryOptions,
  dmUnreadCountQueryOptions,
} from '../queries';

export const useHasUnreadMessages = (enabled: boolean): boolean => {
  const { user } = useAuthContext();
  const { isSettled } = useShellState();
  const isEnabled = enabled && isSettled && !!user?.id;
  // The shell state query seeds both counts; these only fetch as a fallback.
  // Both come from the API, so no page opens a chat session just for a badge.
  const { data: requestCount = 0 } = useQuery({
    ...dmRequestCountQueryOptions(user),
    enabled: isEnabled,
  });
  const { data: unreadCount = 0 } = useQuery({
    ...dmUnreadCountQueryOptions(user),
    enabled: isEnabled,
  });

  return requestCount > 0 || unreadCount > 0;
};
