import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import {
  useNotificationPreference,
  checkHasStatusPreference,
  UseNotificationPreferenceProps,
} from './useNotificationPreference';

export type UseNotificationPreferenceToggleProps = {
  params: UseNotificationPreferenceProps['params'][0] | undefined;
};

export type UseNotificationPreferenceToggle = {
  haveNotificationsOn: boolean;
  isReady: boolean;
  onToggle: () => Promise<{ isSubscribed: boolean }>;
};

export const useNotificationPreferenceToggle = ({
  params,
}: UseNotificationPreferenceToggleProps): UseNotificationPreferenceToggle => {
  const {
    preferences,
    subscribeNotification,
    clearNotificationPreference,
    isFetching,
    isPreferencesReady,
  } = useNotificationPreference({
    params: params ? [params] : undefined,
  });

  const isSubscribed = useMemo(() => {
    return !!preferences?.some((item) =>
      checkHasStatusPreference(
        item,
        params?.notificationType,
        params?.referenceId,
        [NotificationPreferenceStatus.Subscribed],
      ),
    );
  }, [preferences, params?.notificationType, params?.referenceId]);

  const { mutateAsync: onToggle } = useMutation({
    mutationFn: async (): ReturnType<
      UseNotificationPreferenceToggle['onToggle']
    > => {
      const notificationPreferenceParams = {
        type: params.notificationType,
        referenceId: params.referenceId,
      };

      if (isSubscribed) {
        await clearNotificationPreference(notificationPreferenceParams);
      } else {
        await subscribeNotification(notificationPreferenceParams);
      }

      return {
        isSubscribed: !isSubscribed,
      };
    },
  });

  return {
    haveNotificationsOn: isSubscribed,
    isReady: !isFetching && isPreferencesReady,
    onToggle,
  };
};
