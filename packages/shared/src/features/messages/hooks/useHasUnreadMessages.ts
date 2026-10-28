import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useShellState } from '../../../contexts/ShellStateContext';
import {
  dmRequestCountQueryOptions,
  dmUnreadCountQueryOptions,
} from '../queries';
import { lfgWaitingCountQueryOptions } from '../../lfg/queries';
import { useLfgEnabled } from '../../lfg/hooks/useLfgEnabled';

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
  // Reach-outs to the viewer's posts wait in the Requests tab too. The shell
  // state seeds the count for everyone, so the flag decides.
  const { isEnabled: isLfgEnabled } = useLfgEnabled();
  const { data: lfgWaitingCount = 0 } = useQuery(
    lfgWaitingCountQueryOptions(user, { enabled: isEnabled && isLfgEnabled }),
  );

  return (
    requestCount > 0 || unreadCount > 0 || (isLfgEnabled && lfgWaitingCount > 0)
  );
};
