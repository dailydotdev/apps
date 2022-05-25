import { storageWrapper as storage } from '@dailydotdev/shared/src/lib/storageWrapper';
import { useMemo, useState } from 'react';

const EXTENSION_ALERTS_LOCAL_KEY = 'extension:alerts';

interface ExtensionAlerts {
  displayCompanionPopup?: boolean;
}

type ExtensionAlertsReturnType = {
  alerts: ExtensionAlerts;
  updateAlerts: (updated: ExtensionAlerts) => void;
};

const getExtensionAlerts = (): ExtensionAlerts => {
  const data = storage.getItem(EXTENSION_ALERTS_LOCAL_KEY);

  if (!data) {
    return {};
  }

  try {
    return JSON.parse(data);
  } catch (ex) {
    return {};
  }
};

const updateExtensionAlerts = (
  current: ExtensionAlerts,
  updated: ExtensionAlerts,
): ExtensionAlerts => {
  const data = { ...current, ...updated };
  storage.setItem(EXTENSION_ALERTS_LOCAL_KEY, JSON.stringify(data));
  return data;
};

export default function useExtensionAlerts(): ExtensionAlertsReturnType {
  const [alerts, setAlerts] = useState(getExtensionAlerts());

  const updateAlerts = (updated: ExtensionAlerts) => {
    const update = updateExtensionAlerts(alerts, updated);
    setAlerts(update);
  };

  return useMemo(() => {
    return {
      alerts,
      updateAlerts,
    };
  }, [alerts, updateAlerts]);
}
