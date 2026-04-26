import { useCallback, useMemo } from 'react';
import { NotificationType } from '../../components/notifications/utils';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import useNotificationSettings from './useNotificationSettings';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, NotificationPromptSource } from '../../lib/log';

type MajorHeadlinesOrigin = 'settings' | 'highlights_page' | 'feed_card';

type UseMajorHeadlinesSubscriptionResult = {
  isSubscribed: boolean;
  isPushEnabled: boolean;
  isLoading: boolean;
  subscribe: (origin: MajorHeadlinesOrigin) => Promise<void>;
  unsubscribe: (origin: MajorHeadlinesOrigin) => Promise<void>;
};

const ORIGIN_TO_PROMPT_SOURCE: Record<
  MajorHeadlinesOrigin,
  NotificationPromptSource
> = {
  settings: NotificationPromptSource.MajorHeadlinesSettings,
  highlights_page: NotificationPromptSource.MajorHeadlinesPage,
  feed_card: NotificationPromptSource.MajorHeadlinesCard,
};

export const useMajorHeadlinesSubscription =
  (): UseMajorHeadlinesSubscriptionResult => {
    const { user } = useAuthContext();
    const { logEvent } = useLogContext();
    const { isSubscribed: isPushEnabled } = usePushNotificationContext();
    const { onEnablePush } = usePushNotificationMutation();
    const {
      notificationSettings,
      isLoadingPreferences,
      setNotificationStatusBulk,
    } = useNotificationSettings();

    const settings =
      notificationSettings?.[NotificationType.MajorHeadlineAdded];
    const isInAppSubscribed =
      settings?.inApp === NotificationPreferenceStatus.Subscribed;
    const isEmailSubscribed =
      settings?.email === NotificationPreferenceStatus.Subscribed;
    const isSubscribed = isInAppSubscribed || isEmailSubscribed;

    const subscribe = useCallback(
      async (origin: MajorHeadlinesOrigin) => {
        if (!user) {
          return;
        }

        await onEnablePush(ORIGIN_TO_PROMPT_SOURCE[origin]);

        setNotificationStatusBulk([
          {
            type: NotificationType.MajorHeadlineAdded,
            channel: 'inApp',
            status: NotificationPreferenceStatus.Subscribed,
          },
          {
            type: NotificationType.MajorHeadlineAdded,
            channel: 'email',
            status: NotificationPreferenceStatus.Subscribed,
          },
        ]);

        logEvent({
          event_name: LogEvent.EnableMajorHeadlinesAlerts,
          extra: JSON.stringify({ origin }),
        });
      },
      [user, onEnablePush, setNotificationStatusBulk, logEvent],
    );

    const unsubscribe = useCallback(
      async (origin: MajorHeadlinesOrigin) => {
        if (!user) {
          return;
        }

        setNotificationStatusBulk([
          {
            type: NotificationType.MajorHeadlineAdded,
            channel: 'inApp',
            status: NotificationPreferenceStatus.Muted,
          },
          {
            type: NotificationType.MajorHeadlineAdded,
            channel: 'email',
            status: NotificationPreferenceStatus.Muted,
          },
        ]);

        logEvent({
          event_name: LogEvent.DisableMajorHeadlinesAlerts,
          extra: JSON.stringify({ origin }),
        });
      },
      [user, setNotificationStatusBulk, logEvent],
    );

    return useMemo(
      () => ({
        isSubscribed,
        isPushEnabled,
        isLoading: isLoadingPreferences,
        subscribe,
        unsubscribe,
      }),
      [
        isSubscribed,
        isPushEnabled,
        isLoadingPreferences,
        subscribe,
        unsubscribe,
      ],
    );
  };
