import { useMemo, useEffect } from 'react';
import usePersistentState from './usePersistentState';
import {
  ALERT_DEFAULTS,
  AlertContextData,
  Alerts,
} from '../contexts/AlertContext';

export default function useAlertContext(
  fetchedAlerts?: Alerts | undefined,
): AlertContextData {
  const [alerts, setAlerts] = usePersistentState('alert', null, ALERT_DEFAULTS);

  useEffect(() => {
    if (fetchedAlerts) {
      setAlerts(fetchedAlerts);
    }
  }, [fetchedAlerts]);

  return useMemo<AlertContextData>(
    () => ({
      alerts,
      setAlerts,
    }),
    [alerts],
  );
}
