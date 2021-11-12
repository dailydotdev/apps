import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo, useEffect } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import usePersistentState from '../hooks/usePersistentState';
import { apiUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: false,
  rank: false,
};

export interface AlertContextData {
  alerts: Alerts;
  setAlerts?: (alerts: Alerts) => Promise<void>;
  updateAlerts?: UseMutateAsyncFunction<
    unknown,
    unknown,
    Alerts,
    () => Promise<void>
  >;
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
  const [alerts, setAlerts] = usePersistentState<Alerts>(
    'alert',
    null,
    ALERT_DEFAULTS,
  );
  const { mutateAsync: updateAlerts } = useMutation<
    unknown,
    unknown,
    Alerts,
    () => Promise<void>
  >(
    (params) =>
      request(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: params,
      }),
    {
      onMutate: (params) => {
        const rollback = Object.keys(alerts).reduce(
          (values, key) => ({ ...values, [key]: alerts[key] }),
          {},
        );

        setAlerts({ ...alerts, ...params });

        return () => setAlerts({ ...alerts, ...rollback });
      },
      onError: (_, __, rollback) => rollback(),
    },
  );

  const alertContextData = useMemo(
    () => ({
      alerts,
      setAlerts,
      updateAlerts,
    }),
    [alerts, setAlerts, updateAlerts],
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
