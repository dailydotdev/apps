import { useEffect, useState } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useTopSites } from '../hooks/useTopSites';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useSettingsContext } from '../../../contexts/SettingsContext';

const [ShortcutsProvider, useShortcuts] = createContextProvider(
  () => {
    const { logEvent } = useLogContext();
    const { customLinks } = useSettingsContext();

    const [isManual, setIsManual] = useState(false);
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
      if (hasCheckedPermission && topSites?.length) {
        setIsManual(false);
      }
    }, [hasCheckedPermission, topSites?.length]);

    useEffect(() => {
      if (customLinks?.length > 0 && !isManual) {
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
    };
  },
  {
    scope: 'ShortcutsProvider',
  },
);

export { ShortcutsProvider, useShortcuts };
