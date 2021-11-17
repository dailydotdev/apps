import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo, useEffect } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import usePersistentState from '../hooks/usePersistentState';
import { apiUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: false,
  rankLastSeen: null,
};

export interface AlertContextData {
  alerts: Alerts;
  updateAlerts?: UseMutateAsyncFunction<
    unknown,
    unknown,
    Alerts,
    () => Promise<void>
  >;
}

export const MAX_DATE = new Date(3021, 0, 1);

const AlertContext = React.createContext<AlertContextData>({
  alerts: ALERT_DEFAULTS,
});

interface AlertContextProviderProps {
  children: ReactNode;
  alerts?: Alerts;
}

const STORAGE_KEY = 'alert';

export const AlertContextProvider = ({
  children,
  alerts: alertsProp,
}: AlertContextProviderProps): ReactElement => {
  const [alerts, setAlerts] = usePersistentState(
    STORAGE_KEY,
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
        const rollback = Object.keys(params).reduce(
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
      updateAlerts,
    }),
    [alerts, updateAlerts],
  );

  useEffect(() => {
    if (alertsProp) {
      setAlerts({ ...alerts, ...alertsProp });
    }
  }, [alertsProp]);

  return (
    <AlertContext.Provider value={alertContextData}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
