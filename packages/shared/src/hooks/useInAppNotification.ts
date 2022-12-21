import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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

export interface IInAppNotification {
  notification: NewNotification;
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
    payload: NewNotification,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setInAppNotification({ notification: payload, timer, ...props });

  useSubscription(
    () => ({
      query: NEW_NOTIFICATIONS_SUBSCRIPTION,
    }),
    {
      next: (data: { newNotifications: NewNotification }) => {
        displayNotification(data.newNotifications);
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
