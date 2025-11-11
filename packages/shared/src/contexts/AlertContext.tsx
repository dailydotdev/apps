import type { ReactNode, ReactElement } from 'react';
import React, { useMemo, useContext } from 'react';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { Alerts, AlertsUpdate } from '../graphql/alerts';
import {
  UPDATE_ALERTS,
  UPDATE_LAST_BOOT_POPUP,
  UPDATE_LAST_REFERRAL_REMINDER,
  UPDATE_HAS_SEEN_OPPORTUNITY,
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
  briefBannerLastSeen: null,
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
  updateHasSeenOpportunity?: UseMutateAsyncFunction;
  clearOpportunityAlert?: UseMutateAsyncFunction;
}

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
  >({
    mutationFn: (params) =>
      gqlClient.request(UPDATE_ALERTS, {
        data: params,
      }),
    onMutate: (params) => updateAlerts({ ...alerts, ...params }),

    onError: (_, params) => {
      const rollback = Object.keys(params).reduce(
        (values, key) => ({ ...values, [key]: alerts[key] }),
        {},
      );

      updateAlerts({ ...alerts, ...rollback });
    },
  });

  const { mutateAsync: updateLastReferralReminder } = useMutation({
    mutationFn: () => gqlClient.request(UPDATE_LAST_REFERRAL_REMINDER),
  });

  const { mutateAsync: updateLastBootPopup } = useMutation({
    mutationFn: () => gqlClient.request(UPDATE_LAST_BOOT_POPUP),

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
  });

  const { mutateAsync: updateHasSeenOpportunity } = useMutation<
    unknown,
    unknown,
    boolean | void
  >({
    mutationFn: (hasSeenOpportunity = true) =>
      gqlClient.request(UPDATE_HAS_SEEN_OPPORTUNITY, { hasSeenOpportunity }),
  });

  const alertContextData = useMemo<AlertContextData>(
    () => ({
      alerts,
      isFetched,
      loadedAlerts,
      updateAlerts: updateRemoteAlerts,
      updateLastReferralReminder,
      updateLastBootPopup,
      updateHasSeenOpportunity,
    }),
    [
      alerts,
      loadedAlerts,
      isFetched,
      updateRemoteAlerts,
      updateLastReferralReminder,
      updateLastBootPopup,
      updateHasSeenOpportunity,
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
