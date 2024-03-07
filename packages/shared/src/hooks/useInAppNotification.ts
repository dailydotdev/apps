import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationContext } from '../contexts/NotificationsContext';
import {
  NewNotification,
  NEW_NOTIFICATIONS_SUBSCRIPTION,
} from '../graphql/notifications';
import useSubscription from './useSubscription';

interface UseInAppNotification {
  addToQueue: (notification: NewNotification) => void;
  clearNotifications: () => void;
  displayNotification: (
    notification: NewNotification,
    params?: NotifyOptionalProps,
  ) => void;
  dismissNotification: () => void;
}

interface PushNotificationSubscription {
  newNotification: NewNotification;
}

export interface InAppNotification {
  notification: NewNotification;
  timer: number;
}

export const IN_APP_NOTIFICATION_KEY = ['in_app_notification'];
const MAX_QUEUE_LENGTH = 5;

export interface NotifyOptionalProps {
  timer?: number;
}

const registeredNotification = {};

const queue: NewNotification[] = [];
export const useInAppNotification = (): UseInAppNotification => {
  const client = useQueryClient();
  const { incrementUnreadCount } = useNotificationContext();
  const { data: notification } = useQuery<InAppNotification>(
    IN_APP_NOTIFICATION_KEY,
    () =>
      client.getQueryData<InAppNotification>(IN_APP_NOTIFICATION_KEY) || null,
  );
  const hasNotification = (): boolean =>
    !!client.getQueryData(IN_APP_NOTIFICATION_KEY);
  const setInAppNotification = (data: InAppNotification) =>
    client.setQueryData(IN_APP_NOTIFICATION_KEY, data);

  const displayNotification = (
    payload: NewNotification,
    { timer = 5000 }: NotifyOptionalProps = {},
  ) => {
    setInAppNotification({ notification: payload, timer });
  };

  const addToQueue = (newNotification: NewNotification) => {
    if (!newNotification || registeredNotification[newNotification.id]) {
      return;
    }

    registeredNotification[newNotification.id] = true;
    incrementUnreadCount();
    queue.push(newNotification);
    if (queue.length >= MAX_QUEUE_LENGTH) {
      queue.shift();
    }
    if (!hasNotification()) {
      displayNotification(queue.shift());
    }
  };

  const dismissNotification = () => {
    if (queue.length) {
      displayNotification(queue.shift());
      return;
    }
    setInAppNotification(null);
  };

  const clearNotifications = () => {
    queue.length = 0;
    dismissNotification();
  };

  useSubscription(
    () => ({
      query: NEW_NOTIFICATIONS_SUBSCRIPTION,
    }),
    {
      next: ({ newNotification }: PushNotificationSubscription) => {
        addToQueue(newNotification);
      },
    },
  );

  return useMemo(
    () => ({
      addToQueue,
      clearNotifications,
      displayNotification,
      dismissNotification,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [notification],
  );
};
