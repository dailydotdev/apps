import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo, useEffect } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import usePersistentState from '../hooks/usePersistentState';
import { apiUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: false,
};

export interface AlertContextData {
  alerts: { filter?: boolean };
  setAlerts?: (alerts: Alerts) => Promise<void>;
  disableFilterAlert?: UseMutateAsyncFunction;
}

const AlertContext = React.createContext<AlertContextData>({
  alerts: ALERT_DEFAULTS,
});

interface AlertContextProviderProps {
  children: ReactNode;
  alerts?: Alerts;
}

export const AlertContextProvider = ({
  children,
  alerts: alertsProp,
}: AlertContextProviderProps): ReactElement => {
  const [alerts, setAlerts] = usePersistentState('alert', null, ALERT_DEFAULTS);
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

  const alertContextData = useMemo(
    () => ({
      alerts,
      setAlerts,
      disableFilterAlert,
    }),
    [alerts, setAlerts, disableFilterAlert],
  );

  useEffect(() => {
    if (alertsProp) {
      setAlerts(alertsProp);
    }
  }, [alertsProp]);

  return (
    <AlertContext.Provider value={alertContextData}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
