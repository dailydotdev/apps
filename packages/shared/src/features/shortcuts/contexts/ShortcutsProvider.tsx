import { useCallback, useEffect, useState } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useTopSites } from '../hooks/useTopSites';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import usePersistentContext from '../../../hooks/usePersistentContext';

export type ShortcutsSourcePreference = 'manual' | 'topsites' | null;

const SHORTCUTS_SOURCE_KEY = 'shortcuts_source_preference';

const [ShortcutsProvider, useShortcuts] = createContextProvider(
  () => {
    const { logEvent } = useLogContext();
    const { customLinks } = useSettingsContext();

    const [isManual, setIsManual] = useState(false);
    // Persist the explicit "My shortcuts / Most visited" choice so the feed
    // stays consistent across reloads — without persistence, opening a new
    // tab would re-run the auto-detection and could bounce the user back
    // to a different source than the one they picked.
    const [persistedSource, persistSource] =
      usePersistentContext<ShortcutsSourcePreference>(
        SHORTCUTS_SOURCE_KEY,
        null,
        ['manual', 'topsites', null],
      );
    const sourcePreference: ShortcutsSourcePreference = persistedSource ?? null;
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    const {
      topSites,
      hasCheckedPermission,
      askTopSitesPermission,
      revokePermission,
    } = useTopSites();

    const onRevokePermission = async () => {
      await revokePermission();

      setIsManual(true);

      logEvent({
        event_name: LogEvent.RevokeShortcutAccess,
        target_type: TargetType.Shortcuts,
      });
    };

    useEffect(() => {
      // Auto-flip to top sites once we have permission + sites — but only if
      // the user hasn't explicitly asked for manual mode.
      if (sourcePreference === 'manual') {
        return;
      }
      if (hasCheckedPermission && topSites?.length) {
        setIsManual(false);
      }
    }, [hasCheckedPermission, topSites?.length, sourcePreference]);

    useEffect(() => {
      // Auto-flip to manual mode when the user has saved custom links — but
      // only if they haven't explicitly asked for top sites instead.
      if (sourcePreference === 'topsites') {
        return;
      }
      if ((customLinks?.length ?? 0) > 0 && !isManual) {
        setIsManual(true);
      }
    }, [customLinks, isManual, sourcePreference]);

    const setSourceManual = useCallback(
      (manual: boolean) => {
        setIsManual(manual);
        // Best-effort persistence — even if the IDB write fails the local
        // isManual flag still drives this session, so the user sees the
        // expected feed for the rest of the visit.
        persistSource(manual ? 'manual' : 'topsites').catch(() => undefined);
      },
      [persistSource],
    );

    // Re-hydrate the in-memory `isManual` flag from the persisted preference
    // on mount so the feed and popup cards line up with the user's saved
    // choice before any auto-detection effect runs.
    useEffect(() => {
      if (persistedSource === 'manual' && !isManual) {
        setIsManual(true);
      } else if (persistedSource === 'topsites' && isManual) {
        setIsManual(false);
      }
      // Only sync when the persisted value loads/changes; avoid running on
      // every isManual flip (the explicit setter above already handles that).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [persistedSource]);

    return {
      isManual,
      setIsManual,
      // Use this when the user is making an explicit source choice (e.g.
      // tapping the My shortcuts / Most visited tabs). Pure setIsManual
      // works for legacy call sites that just want to flip the local flag.
      setSourceManual,
      sourcePreference,
      topSites,
      hasCheckedPermission,
      askTopSitesPermission,
      onRevokePermission,
      showPermissionsModal,
      setShowPermissionsModal,
    };
  },
  {
    scope: 'ShortcutsProvider',
  },
);

export { ShortcutsProvider, useShortcuts };
