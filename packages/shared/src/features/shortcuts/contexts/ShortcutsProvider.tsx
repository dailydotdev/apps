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
    const { customLinks } = useSettingsContext();

    const [isManual, setIsManual] = useState(false);
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

    useEffect(() => {
      if (hasCheckedPermission && topSites?.length) {
        setIsManual(false);
      }
    }, [hasCheckedPermission, topSites?.length]);

    useEffect(() => {
      if ((customLinks?.length ?? 0) > 0 && !isManual) {
        setIsManual(true);
      }
    }, [customLinks, isManual]);

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
