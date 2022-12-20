import { useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { NotificationIcon } from '../components/notifications/utils';
import {
  Notification,
  NotificationAvatarType,
  NotificationType,
} from '../graphql/notifications';

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
  const sampleNotificationTitle = 'Welcome to your new notification center!';
  const sampleNotificationDescription =
    'The notification system notifies you of important events such as replies, mentions, updates etc.';

  const sampleNotification: Notification = {
    createdAt: new Date(),
    id: 'sadasd',
    userId: 'asdasdas',
    icon: NotificationIcon.Comment,
    title: `<p>${sampleNotificationTitle}</p>`,
    description: `<p>${sampleNotificationDescription}</p>`,
    type: NotificationType.System,
    targetUrl: 'post url',
    avatars: [
      {
        name: 'user',
        image: 'user avatar',
        referenceId: 'user',
        targetUrl: 'webapp/user',
        type: NotificationAvatarType.User,
      },
    ],
  };
  const initialData: IInAppNotification = {
    notification: sampleNotification,
    timer: 1000000,
  };
  const { data: notification } = useQuery<IInAppNotification>(
    IN_APP_NOTIFICATION_KEY,
    { initialData },
  );
  const setInAppNotification = (data: IInAppNotification) =>
    client.setQueryData(IN_APP_NOTIFICATION_KEY, data);

  const displayNotification = (
    payload: Notification,
    { timer = 5000, ...props }: NotifyOptionalProps = {},
  ) => setInAppNotification({ notification: payload, timer, ...props });

  return useMemo(
    () => ({
      displayNotification,
      dismissNotification: () =>
        notification && setInAppNotification({ ...notification, timer: 0 }),
    }),
    [notification],
  );
};
