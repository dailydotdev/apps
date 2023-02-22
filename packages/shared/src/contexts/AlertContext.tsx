import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo } from 'react';
import { UseMutateAsyncFunction, useMutation } from 'react-query';
import { Alerts, UPDATE_ALERTS } from '../graphql/alerts';
import { graphqlUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: true,
  rankLastSeen: null,
  myFeed: null,
  showSquadTour: true,
};

export interface AlertContextData {
  alerts: Alerts;
  isFetched?: boolean;
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
  isFetched?: boolean;
  loadedAlerts?: boolean;
  updateAlerts?: (alerts: Alerts) => unknown;
}

export const AlertContextProvider = ({
  children,
  alerts = ALERT_DEFAULTS,
  loadedAlerts,
  isFetched,
  updateAlerts,
}: AlertContextProviderProps): ReactElement => {
  const { mutateAsync: updateRemoteAlerts } = useMutation<
    unknown,
    unknown,
    Alerts
  >(
    (params) =>
      request(graphqlUrl, UPDATE_ALERTS, {
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
      isFetched,
      loadedAlerts,
      updateAlerts: updateRemoteAlerts,
    }),
    [alerts, loadedAlerts, isFetched, updateRemoteAlerts],
  );

  return (
    <AlertContext.Provider value={alertContextData}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;
