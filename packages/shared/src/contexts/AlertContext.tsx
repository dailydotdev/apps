import request from 'graphql-request';
import React, {
  ReactNode,
  ReactElement,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
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
  updateAlerts: (alerts: Alerts) => unknown;
}

export const AlertContextProvider = ({
  children,
  alerts = ALERT_DEFAULTS,
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

  const alertContextData = useMemo(
    () => ({
      alerts,
      updateRemoteAlerts,
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
