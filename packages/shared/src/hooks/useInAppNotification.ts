import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useNotificationContext } from '../contexts/NotificationsContext';
import {
  NewNotification,
  NEW_NOTIFICATIONS_SUBSCRIPTION,
} from '../graphql/notifications';
import useSubscription from './useSubscription';

interface UseInAppNotification {
  displayNotification: (
    notification: NewNotification,
    params?: NotifyOptionalProps,
  ) => void;
  dismissNotification: () => void;
}

export interface InAppNotification {
  notification: NewNotification;
  timer: number;
}

export const IN_APP_NOTIFICATION_KEY = 'in_app_notification';

export interface NotifyOptionalProps {
  timer?: number;
}

export const useInAppNotification = (): UseInAppNotification => {
  const client = useQueryClient();
  const { data: notification } = useQuery<InAppNotification>(
    IN_APP_NOTIFICATION_KEY,
  );
  const setInAppNotification = (data: InAppNotification) =>
    client.setQueryData(IN_APP_NOTIFICATION_KEY, data);

  const { incrementUnreadCount } = useNotificationContext();

  const displayNotification = (
    payload: NewNotification,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setInAppNotification({ notification: payload, timer, ...props });

  useSubscription(
    () => ({
      query: NEW_NOTIFICATIONS_SUBSCRIPTION,
    }),
    {
      next: (data: { newNotification: NewNotification }) => {
        displayNotification(data.newNotification);
        incrementUnreadCount();
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
