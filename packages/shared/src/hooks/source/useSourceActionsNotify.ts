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

export type UseSourceSubscriptionProps = {
  source: Pick<Source, 'id'> | Source;
};

export type UseSourceSubscription = {
  haveNotifications: boolean;
  isReady: boolean;
  onNotify: () => Promise<void>;
};

export const useSourceActionsNotify = ({
  source,
}: UseSourceSubscriptionProps): UseSourceSubscription => {
  const { logEvent } = useLogContext();
  const { isLoggedIn, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { haveNotifications, isReady, onToggle } =
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

    const displayName = 'name' in source ? source.name : source?.id;

    displayToast(
      notifications.isSubscribed
        ? `✅ You'll get notified every time ${displayName} posts`
        : `⛔️ You'll no longer get notified about ${displayName} posts`,
    );

    // ask for push notifications permission
    try {
      await enablePushNotifications();
    } catch (e) {
      console.error(e);
    }
  }, [source, isLoggedIn, onToggle, logEvent, displayToast, showLogin]);

  return {
    haveNotifications,
    isReady,
    onNotify,
  };
};
