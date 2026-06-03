import { useCallback, useEffect, useState } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useTopSites } from '../hooks/useTopSites';
import { useBrowserBookmarks } from '../hooks/useBrowserBookmarks';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import type { ImportSource } from '../types';
import type { LazyModal } from '../../../components/modals/common/types';

const [ShortcutsProvider, useShortcuts] = createContextProvider(
  () => {
    const { logEvent } = useLogContext();
    const { flags, updateFlag } = useSettingsContext();

    // `isManual` is the legacy boolean view of `flags.shortcutsMode`.
    // Bridge writes both directions so legacy modals stay in sync with
    // the canonical flag the hub reads from.
    const [isManualState, setIsManualState] = useState<boolean>(
      (flags?.shortcutsMode ?? 'manual') === 'manual',
    );
    const setIsManual = useCallback(
      (next: boolean) => {
        setIsManualState(next);
        const desired = next ? 'manual' : 'auto';
        if ((flags?.shortcutsMode ?? 'manual') !== desired) {
          updateFlag('shortcutsMode', desired);
        }
      },
      [flags?.shortcutsMode, updateFlag],
    );
    const isManual = isManualState;
    useEffect(() => {
      const expected = (flags?.shortcutsMode ?? 'manual') === 'manual';
      setIsManualState((prev) => (prev === expected ? prev : expected));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flags?.shortcutsMode]);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showImportSource, setShowImportSourceRaw] =
      useState<ImportSource | null>(null);
    // When the picker was triggered from another modal (e.g. Manage), we
    // remember it so the picker's Cancel button can hand control back there
    // instead of fully dismissing the flow. Narrowed to ShortcutsManage
    // because that's the only prop-less modal we reopen from here.
    const [returnToAfterImport, setReturnToAfterImport] = useState<
      LazyModal.ShortcutsManage | undefined
    >(undefined);

    const setShowImportSource = useCallback(
      (source: ImportSource | null, returnTo?: LazyModal.ShortcutsManage) => {
        setReturnToAfterImport(source ? returnTo : undefined);
        setShowImportSourceRaw(source);
      },
      [],
    );

    const {
      topSites,
      hasCheckedPermission,
      askTopSitesPermission,
      revokePermission,
    } = useTopSites();

    const {
      bookmarks,
      hasCheckedPermission: hasCheckedBookmarksPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
    } = useBrowserBookmarks();

    const onRevokePermission = async () => {
      await revokePermission();

      setIsManual(true);

      logEvent({
        event_name: LogEvent.RevokeShortcutAccess,
        target_type: TargetType.Shortcuts,
      });
    };

    return {
      isManual,
      setIsManual,
      topSites,
      hasCheckedPermission,
      askTopSitesPermission,
      onRevokePermission,
      showPermissionsModal,
      setShowPermissionsModal,
      // New hub state
      bookmarks,
      hasCheckedBookmarksPermission,
      askBookmarksPermission,
      revokeBookmarksPermission,
      showImportSource,
      setShowImportSource,
      returnToAfterImport,
    };
  },
  {
    scope: 'ShortcutsProvider',
  },
);

export { ShortcutsProvider, useShortcuts };
