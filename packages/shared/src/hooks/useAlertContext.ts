import { useMemo, useEffect } from 'react';
import { useMutation } from 'react-query';
import request from 'graphql-request';
import { UPDATE_ALERTS, Alerts } from '../graphql/alerts';
import { apiUrl } from '../lib/config';
import usePersistentState from './usePersistentState';
import { ALERT_DEFAULTS, AlertContextData } from '../contexts/AlertContext';

export default function useAlertContext(
  fetchedAlerts?: Alerts | undefined,
): AlertContextData {
  const [alerts, setAlerts] = usePersistentState('alert', null, ALERT_DEFAULTS);

  useEffect(() => {
    if (fetchedAlerts) {
      setAlerts(fetchedAlerts);
    }
  }, [fetchedAlerts]);

  const { mutateAsync: disableFilterAlert } = useMutation<
    unknown,
    unknown,
    void,
    () => Promise<void>
  >(
    () =>
      request(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: { filter: false },
      }),
    {
      onMutate: () => {
        setAlerts({ ...alerts, filter: false });

        return () => setAlerts({ ...alerts, filter: true });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  return useMemo<AlertContextData>(
    () => ({
      alerts,
      setAlerts,
      disableFilterAlert,
    }),
    [alerts],
  );
}
