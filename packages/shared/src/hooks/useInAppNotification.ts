import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { NEW_NOTIFICATIONS_SUBSCRIPTION, Notification } from '../graphql/notifications';
import useSubscription from './useSubscription';

interface UseInAppNotification {
  displayNotification: (
    notification: Notification,
    params?: NotifyOptionalProps,
  ) => void;
  dismissNotification: () => void;
}

export interface IInAppNotification {
  notification: Notification;
  timer: number;
}

export const IN_APP_NOTIFICATION_KEY = 'in_app_notification';

export interface NotifyOptionalProps {
  timer?: number;
}

export const useInAppNotification = (): UseInAppNotification => {
  const client = useQueryClient();
  const { data: notification } = useQuery<IInAppNotification>(
    IN_APP_NOTIFICATION_KEY,
  );
  const setInAppNotification = (data: IInAppNotification) =>
    client.setQueryData(IN_APP_NOTIFICATION_KEY, data);

  const displayNotification = (
    payload: Notification,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setInAppNotification({ notification: payload, timer, ...props });

  useSubscription(
    () => ({
      query: NEW_NOTIFICATIONS_SUBSCRIPTION,
    }),
    {
      next: (data: Notification) => {
        displayNotification(data);
      },
    },
  );

  return useMemo(
    () => ({
      displayNotification,
      dismissNotification: () =>
        notification && setInAppNotification({ ...notification, timer: 0 }),
    }),
    [notification],
  );
};
