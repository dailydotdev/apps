import { useMemo } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

interface UseShortcuts {
  isShortcutsV1: boolean;
}

/**
 * Hook to determine if the user is on the old version of shortcuts
 * More information in this thread: https://dailydotdev.slack.com/archives/C02JAUF8HJL/p1720008775281939
 * Keywords: shortcutsUI, onboarding_most_visited
 */
export const useShortcuts = (): UseShortcuts => {
  const { user } = useAuthContext();

  const isShortcutsV1 = useMemo(
    () =>
      user?.isTeamMember ||
      new Date(user?.createdAt) >= new Date('2024-04-16T00:00:00.000Z'),
    [user?.isTeamMember, user?.createdAt],
  );

  return {
    isShortcutsV1,
  };
};
