import request from 'graphql-request';
import React, { ReactNode, ReactElement, useMemo, useContext } from 'react';
import { UseMutateAsyncFunction, useMutation } from '@tanstack/react-query';
import {
  Alerts,
  AlertsUpdate,
  UPDATE_ALERTS,
  UPDATE_LAST_REFERRAL_REMINDER,
} from '../graphql/alerts';
import { graphqlUrl } from '../lib/config';

export const ALERT_DEFAULTS: Alerts = {
  filter: true,
  rankLastSeen: null,
  myFeed: null,
  squadTour: true,
  showGenericReferral: false,
};

export interface AlertContextData {
  alerts: Alerts;
  isFetched?: boolean;
  loadedAlerts?: boolean;
  updateAlerts?: UseMutateAsyncFunction<
    unknown,
    unknown,
    AlertsUpdate,
    () => Promise<void>
  >;
  updateLastReferralReminder?: UseMutateAsyncFunction;
}

export const MAX_DATE = new Date(3021, 0, 1);

const AlertContext = React.createContext<AlertContextData>({
  alerts: ALERT_DEFAULTS,
  loadedAlerts: false,
});

export interface AlertContextProviderProps {
  children: ReactNode;
  alerts?: Alerts;
  isFetched?: boolean;
  loadedAlerts?: boolean;
  updateAlerts?: (alerts: Alerts) => unknown;
  updateLastReferralReminder?: () => unknown;
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

  const { mutateAsync: updateLastReferralReminder } = useMutation(
    () => request(graphqlUrl, UPDATE_LAST_REFERRAL_REMINDER),
    {
      onMutate: () =>
        updateAlerts({
          ...alerts,
          showGenericReferral: false,
        }),
      onError: () => {
        updateAlerts({
          ...alerts,
          showGenericReferral: true,
        });
      },
    },
  );

  const alertContextData = useMemo<AlertContextData>(
    () => ({
      alerts,
      isFetched,
      loadedAlerts,
      updateAlerts: updateRemoteAlerts,
      updateLastReferralReminder,
    }),
    [
      alerts,
      loadedAlerts,
      isFetched,
      updateRemoteAlerts,
      updateLastReferralReminder,
    ],
  );

  return (
    <AlertContext.Provider value={alertContextData}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;

export const useAlertsContext = (): AlertContextData =>
  useContext(AlertContext);
