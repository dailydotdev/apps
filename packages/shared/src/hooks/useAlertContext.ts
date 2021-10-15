import { useMemo, useEffect } from 'react';
import usePersistentState from './usePersistentState';
import {
  AlertDefaults,
  AlertContextData,
  Alerts,
} from '../contexts/AlertContext';

export default function useAlertContext(
  fetchedAlerts: Alerts | undefined,
): AlertContextData {
  const [alerts, setAlerts] = usePersistentState('alert', null, AlertDefaults);

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
