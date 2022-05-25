import { useMemo, useState } from 'react';
import {
  ExtensionAlerts,
  getExtensionAlerts,
  updateExtensionAlerts,
} from './extensionAlerts';

type ExtensionAlertsReturnType = {
  alerts: ExtensionAlerts;
  updateAlerts: (updated: ExtensionAlerts) => void;
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
