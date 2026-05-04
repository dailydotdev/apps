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
 *
 * Hardening notes:
 * - `ranRef` only flips to `true` AFTER we know whether we imported or not,
 *   so a thrown `importFrom` doesn't permanently lock out retry.
 * - Strict Mode double-invoke is guarded by `inFlightRef` instead of the
 *   commit-time `ranRef` so we never start two parallel imports.
 * - `completeAction` only fires on a real success (imported > 0); if the
 *   browser returned zero top sites we leave the action unchecked and retry
 *   on the next mount.
 */
export const useShortcutsMigration = (): void => {
  const { customLinks, flags } = useSettingsContext();
  const { checkHasCompleted, completeAction, isActionsFetched } = useActions();
  const { topSites, hasCheckedPermission } = useShortcuts();
  // Destructure `importFrom` so the effect's dep list tracks the only
  // function we actually invoke. Depending on `manager` would rerun the
  // effect every time any *other* shortcut field on the manager changed.
  const { importFrom } = useShortcutsManager();
  const { displayToast } = useToastNotification();
  const inFlightRef = useRef(false);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current || inFlightRef.current) {
      return;
    }
    if (!isActionsFetched || !hasCheckedPermission) {
      return;
    }
    if (checkHasCompleted(ActionType.ShortcutsMigratedFromTopSites)) {
      ranRef.current = true;
      return;
    }
    // Auto mode renders live top sites directly, so copying them into
    // `customLinks` would leave the user with a stale manual list the next
    // time they flip back to manual. Latch the migration action anyway so
    // we don't keep re-evaluating this branch on every mount.
    if ((flags?.shortcutsMode ?? 'manual') === 'auto') {
      ranRef.current = true;
      completeAction(ActionType.ShortcutsMigratedFromTopSites);
      return;
    }
    // Once the user has engaged with the hub at all (picked suggestions,
    // added/skipped from the get-started screen, or dismissed it), they own
    // their list. An empty `customLinks` after that point is intentional —
    // never silently re-import top sites over it. We latch the migration
    // action too so this decision persists across devices/new tabs and the
    // effect won't keep re-evaluating on every remount.
    if (checkHasCompleted(ActionType.FirstShortcutsSession)) {
      ranRef.current = true;
      completeAction(ActionType.ShortcutsMigratedFromTopSites);
      return;
    }
    if ((customLinks?.length ?? 0) > 0) {
      return;
    }
    if (!topSites?.length) {
      return;
    }

    inFlightRef.current = true;
    const items = topSites.map((s) => ({ url: s.url }));
    importFrom('topSites', items)
      .then((result) => {
        if (result.imported > 0) {
          displayToast(
            'We imported your most visited sites. You can edit them anytime.',
          );
          completeAction(ActionType.ShortcutsMigratedFromTopSites);
          ranRef.current = true;
        }
      })
      .catch(() => {
        // Swallow: if the import failed we want the next mount to retry.
        // The user is not blocked — we never showed a loading spinner.
      })
      .finally(() => {
        inFlightRef.current = false;
      });
  }, [
    isActionsFetched,
    hasCheckedPermission,
    checkHasCompleted,
    completeAction,
    customLinks,
    flags,
    topSites,
    importFrom,
    displayToast,
  ]);
};
