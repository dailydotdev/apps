import { useAuthContext } from '../contexts/AuthContext';
import { ActionType } from '../graphql/actions';
import { useActions } from './useActions';
import { checkIsExtension } from '../lib/func';
import { useSettingsContext } from '../contexts/SettingsContext';

export interface UseShortcutsUser {
  isOldUser: boolean;
  isOldUserWithNoShortcuts: boolean;
  hasCompletedFirstSession: boolean;
  showToggleShortcuts: boolean;
}

const DATE_TO_SHOW_SHORTCUTS = new Date('2024-07-16');

export const useShortcutsUser = (): UseShortcutsUser => {
  const { user, isAuthReady } = useAuthContext();
  const { checkHasCompleted, isActionsFetched } = useActions();
  const isExtension = checkIsExtension();
  const { showTopSites } = useSettingsContext();

  const isOldUser =
    isAuthReady &&
    user?.createdAt &&
    new Date(user.createdAt) < DATE_TO_SHOW_SHORTCUTS;
  const hasCompletedFirstSession =
    isActionsFetched && checkHasCompleted(ActionType.FirstShortcutsSession);
  const isOldUserWithNoShortcuts = isOldUser && !hasCompletedFirstSession;

  return {
    isOldUser,
    isOldUserWithNoShortcuts,
    hasCompletedFirstSession,
    showToggleShortcuts:
      isExtension && (!showTopSites || isOldUserWithNoShortcuts),
  };
};
