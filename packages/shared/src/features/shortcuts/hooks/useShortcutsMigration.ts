import { useEffect, useRef } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useActions } from '../../../hooks/useActions';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { ActionType } from '../../../graphql/actions';
import { useShortcutsManager } from './useShortcutsManager';
import { useShortcuts } from '../contexts/ShortcutsProvider';

/**
 * One-time auto-import for users who previously relied on the top-sites mode
 * (had topSites permission + empty customLinks). Seeds customLinks from
 * topSites silently and surfaces a dismissible toast.
 */
export const useShortcutsMigration = (): void => {
  const { customLinks } = useSettingsContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { topSites, hasCheckedPermission } = useShortcuts();
  const manager = useShortcutsManager({
    topSitesUrls: topSites?.map((s) => s.url),
  });
  const { displayToast } = useToastNotification();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) {
      return;
    }
    if (!isActionsFetched || !hasCheckedPermission) {
      return;
    }
    if (checkHasCompleted(ActionType.ShortcutsMigratedFromTopSites)) {
      return;
    }
    if ((customLinks?.length ?? 0) > 0) {
      return;
    }
    if (!topSites?.length) {
      return;
    }

    ranRef.current = true;
    const items = topSites.map((s) => ({ url: s.url }));
    manager.importFrom('topSites', items).then((result) => {
      if (result.imported > 0) {
        displayToast(
          'We imported your most visited sites. You can edit them anytime.',
        );
      }
      completeAction(ActionType.ShortcutsMigratedFromTopSites);
    });
  }, [
    isActionsFetched,
    hasCheckedPermission,
    checkHasCompleted,
    completeAction,
    customLinks,
    topSites,
    manager,
    displayToast,
  ]);
};
