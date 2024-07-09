import React, { ReactNode, ReactElement, useMemo, useContext } from 'react';
import { UseMutateAsyncFunction, useMutation } from '@tanstack/react-query';
import {
  Alerts,
  AlertsUpdate,
  UPDATE_ALERTS,
  UPDATE_LAST_BOOT_POPUP,
  UPDATE_LAST_REFERRAL_REMINDER,
} from '../graphql/alerts';
import { gqlClient } from '../graphql/common';

export const ALERT_DEFAULTS: Alerts = {
  filter: true,
  rankLastSeen: null,
  myFeed: null,
  squadTour: true,
  showGenericReferral: false,
  showStreakMilestone: false,
  lastBootPopup: null,
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
  updateLastBootPopup?: UseMutateAsyncFunction;
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
  updateLastBootPopup?: () => unknown;
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
      gqlClient.request(UPDATE_ALERTS, {
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
    () => gqlClient.request(UPDATE_LAST_REFERRAL_REMINDER),
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

  const { mutateAsync: updateLastBootPopup } = useMutation(
    () => gqlClient.request(UPDATE_LAST_BOOT_POPUP),
    {
      onMutate: () =>
        updateAlerts({
          ...alerts,
          lastBootPopup: new Date(),
          bootPopup: false,
        }),
      onError: () => {
        updateAlerts({
          ...alerts,
          lastBootPopup: null,
          bootPopup: true,
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
      updateLastBootPopup,
    }),
    [
      alerts,
      loadedAlerts,
      isFetched,
      updateRemoteAlerts,
      updateLastReferralReminder,
      updateLastBootPopup,
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
