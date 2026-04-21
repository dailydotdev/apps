import { useEffect, useState } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useTopSites } from '../hooks/useTopSites';
import { useBrowserBookmarks } from '../hooks/useBrowserBookmarks';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import type { ImportSource } from '../types';

const [ShortcutsProvider, useShortcuts] = createContextProvider(
  () => {
    const { logEvent } = useLogContext();
    const { customLinks } = useSettingsContext();

    const [isManual, setIsManual] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [showImportSource, setShowImportSource] = useState<
      ImportSource | null
    >(null);

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
    };
  },
  {
    scope: 'ShortcutsProvider',
  },
);

export { ShortcutsProvider, useShortcuts };
