import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import {
  dmRequestCountQueryOptions,
  dmUnreadCountQueryOptions,
} from '../queries';
import { lfgWaitingCountQueryOptions } from '../../lfg/queries';
import { useLfgEnabled } from '../../lfg/hooks/useLfgEnabled';

type UnreadMessagesCount = {
  unread: number;
  // What waits in the Requests tab: message requests and reach-outs to the
  // viewer's Looking for group posts.
  requests: number;
  total: number;
};

export const useUnreadMessagesCount = (
  enabled: boolean,
): UnreadMessagesCount => {
  const { user } = useAuthContext();
  const { isSettled } = useShellState();
  const isEnabled = enabled && isSettled && !!user?.id;
  // The shell state query seeds every count; these only fetch as a fallback.
  // All come from the API, so no page opens a chat session just for a badge.
  const { data: requestCount = 0 } = useQuery({
    ...dmRequestCountQueryOptions(user),
    enabled: isEnabled,
  });
  const { data: unreadCount = 0 } = useQuery({
    ...dmUnreadCountQueryOptions(user),
    enabled: isEnabled,
  });
  // The shell state seeds the reach-out count for everyone, so the flag
  // decides.
  const { isEnabled: isLfgEnabled } = useLfgEnabled();
  const { data: lfgWaitingCount = 0 } = useQuery(
    lfgWaitingCountQueryOptions(user, { enabled: isEnabled && isLfgEnabled }),
  );
  const requests = requestCount + (isLfgEnabled ? lfgWaitingCount : 0);

  return { unread: unreadCount, requests, total: unreadCount + requests };
};
