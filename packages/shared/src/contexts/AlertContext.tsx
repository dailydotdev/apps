import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import { apiUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: false,
  rankLastSeen: null,
  myFeed: null,
};

export interface AlertContextData {
  alerts: Alerts;
  loadedAlerts?: boolean;
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
  loadedAlerts: false,
});

interface AlertContextProviderProps {
  children: ReactNode;
  alerts?: Alerts;
  loadedAlerts?: boolean;
  updateAlerts?: (alerts: Alerts) => unknown;
}

export const AlertContextProvider = ({
  children,
  alerts = ALERT_DEFAULTS,
  loadedAlerts,
  updateAlerts,
}: AlertContextProviderProps): ReactElement => {
  const { mutateAsync: updateRemoteAlerts } = useMutation<
    unknown,
    unknown,
    Alerts
  >(
    (params) =>
      request(`${apiUrl}/graphql`, UPDATE_ALERTS, {
        data: params,
      }),
    {
      onMutate: (params) => updateAlerts({ ...alerts, ...params }),
      onError: (_, params) => {
        const rollback = Object.keys(params).reduce(
          (values, key) => ({ ...values, [key]: alerts[key] }),
          {},
        );

        updateAlerts({ ...alerts, ...rollback });
      },
    },
  );

  const alertContextData = useMemo<AlertContextData>(
    () => ({
      alerts,
      loadedAlerts,
      updateAlerts: updateRemoteAlerts,
    }),
    [alerts, updateRemoteAlerts],
  );

  return (
    <AlertContext.Provider value={alertContextData}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
