import { useCallback } from 'react';
import { NotificationType } from '../../components/notifications/utils';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { Source } from '../../graphql/sources';
import { LogEvent, NotificationPromptSource } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import {
  useEnableNotification,
  useNotificationPreferenceToggle,
} from '../notifications';
import { useToastNotification } from '../useToastNotification';
import { useFeature } from '../../components/GrowthBookProvider';
import { feature } from '../../lib/featureManagement';

export type UseSourceSubscriptionProps = {
  source: Pick<Source, 'id'> | Source;
};

export type UseSourceSubscription = {
  haveNotificationsOn: boolean;
  isReady: boolean;
  onNotify: () => Promise<void>;
};

export const useSourceActionsNotify = ({
  source,
}: UseSourceSubscriptionProps): UseSourceSubscription => {
  const isNotifyExperiment = useFeature(feature.sourceNotifyButton);
  const { logEvent } = useLogContext();
  const { isLoggedIn, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { haveNotificationsOn, isReady, onToggle } =
    useNotificationPreferenceToggle({
      params: source?.id
        ? {
            notificationType: NotificationType.SourcePostAdded,
            referenceId: source?.id,
          }
        : undefined,
    });

  const { onEnable: enablePushNotifications } = useEnableNotification({
    source: NotificationPromptSource.SourceSubscribe,
  });

  const onNotify = useCallback(async () => {
    if (!source?.id) {
      return;
    }

    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.SourceSubscribe });
      return;
    }

    const notifications = await onToggle();

    logEvent({
      event_name: notifications.isSubscribed
        ? LogEvent.SubscribeSource
        : LogEvent.UnsubscribeSource,
      target_id: source.id,
    });

    if (isNotifyExperiment) {
      const displayName = 'name' in source ? source.name : source?.id;

      displayToast(
        notifications.isSubscribed
          ? `✅ You'll get notified every time ${displayName} posts`
          : `⛔️ You'll no longer get notified about ${displayName} posts`,
      );

      if (notifications.isSubscribed) {
        try {
          await enablePushNotifications();
        } catch (e) {
          // errors are not handled here, do nothing for now
        }
      }
    } else {
      displayToast(
        notifications.isSubscribed
          ? '✅ You are now subscribed'
          : '⛔️ You are now unsubscribed',
      );
    }
  }, [
    source,
    isLoggedIn,
    onToggle,
    logEvent,
    isNotifyExperiment,
    showLogin,
    displayToast,
    enablePushNotifications,
  ]);

  return {
    haveNotificationsOn,
    isReady,
    onNotify,
  };
};
