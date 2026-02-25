import type { ReactNode, ReactElement } from 'react';
import React, { useMemo, useContext } from 'react';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { Alerts } from '../graphql/alerts';
import {
  UPDATE_ALERTS,
  UPDATE_LAST_BOOT_POPUP,
  UPDATE_LAST_REFERRAL_REMINDER,
  UPDATE_HAS_SEEN_OPPORTUNITY,
} from '../graphql/alerts';
import { gqlClient } from '../graphql/common';

export const ALERT_DEFAULTS: Alerts = {
  filter: true,
  rankLastSeen: undefined,
  myFeed: undefined,
  squadTour: true,
  showGenericReferral: false,
  showStreakMilestone: false,
  showAchievementUnlock: null,
  lastBootPopup: undefined,
  briefBannerLastSeen: undefined,
};

export interface AlertContextData {
  alerts: Alerts;
  isFetched?: boolean;
  loadedAlerts?: boolean;
  updateAlerts: UseMutateAsyncFunction<unknown, unknown, Alerts, unknown>;
  updateLastReferralReminder?: UseMutateAsyncFunction<unknown, unknown, void>;
  updateLastBootPopup?: UseMutateAsyncFunction<unknown, unknown, void>;
  updateHasSeenOpportunity?: UseMutateAsyncFunction<
    unknown,
    unknown,
    boolean | void
  >;
  clearOpportunityAlert?: UseMutateAsyncFunction<unknown, unknown, void>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AlertContext = React.createContext<AlertContextData>(null!);

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
  const applyUpdatedAlerts = (updatedAlerts: Alerts): void => {
    updateAlerts?.(updatedAlerts);
  };

  const { mutateAsync: updateRemoteAlerts } = useMutation<
    unknown,
    unknown,
    Alerts
  >({
    mutationFn: (params) =>
      gqlClient.request(UPDATE_ALERTS, {
        data: params,
      }),
    onMutate: (params) => applyUpdatedAlerts({ ...alerts, ...params }),

    onError: (_, params) => {
      const rollback = (Object.keys(params) as Array<keyof Alerts>).reduce(
        (values, key) => ({ ...values, [key]: alerts[key] }),
        {} as Alerts,
      );

      applyUpdatedAlerts({ ...alerts, ...rollback });
    },
  });

  const { mutateAsync: updateLastReferralReminder } = useMutation({
    mutationFn: () => gqlClient.request(UPDATE_LAST_REFERRAL_REMINDER),
  });

  const { mutateAsync: updateLastBootPopup } = useMutation({
    mutationFn: () => gqlClient.request(UPDATE_LAST_BOOT_POPUP),

    onMutate: () =>
      applyUpdatedAlerts({
        ...alerts,
        lastBootPopup: new Date(),
        bootPopup: false,
      }),

    onError: () => {
      applyUpdatedAlerts({
        ...alerts,
        lastBootPopup: undefined,
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
