import { useEffect, useState } from 'react';
import { createContextProvider } from '@kickass-coderz/react';
import { useTopSites } from '../hooks/useTopSites';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';

const [ShortcutsProvider, useShortcuts] = createContextProvider(
  () => {
    const [isManual, setIsManual] = useState(true);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);

    const { logEvent } = useLogContext();

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
