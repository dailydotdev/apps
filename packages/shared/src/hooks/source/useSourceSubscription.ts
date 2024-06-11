import { useCallback } from 'react';
import { NotificationType } from '../../components/notifications/utils';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { Source } from '../../graphql/sources';
import { LogsEvent } from '../../lib/logs';
import { AuthTriggers } from '../../lib/auth';
import { useNotificationPreferenceToggle } from '../notifications';
import { useToastNotification } from '../useToastNotification';

export type UseSourceSubscriptionProps = {
  source: Pick<Source, 'id'>;
};

export type UseSourceSubscription = {
  isSubscribed: boolean;
  isReady: boolean;
  onSubscribe: () => Promise<void>;
};

export const useSourceSubscription = ({
  source,
}: UseSourceSubscriptionProps): UseSourceSubscription => {
  const { trackEvent } = useLogContext();
  const { isLoggedIn, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const { isSubscribed, isReady, onToggle } = useNotificationPreferenceToggle({
    params: source?.id
      ? {
          notificationType: NotificationType.SourcePostAdded,
          referenceId: source?.id,
        }
      : undefined,
  });

  const onSubscribe = useCallback(async () => {
    if (!source?.id) {
      return;
    }

    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.SourceSubscribe });

      return;
    }

    const result = await onToggle();

    trackEvent({
      event_name: result.isSubscribed
        ? LogsEvent.SubscribeSource
        : LogsEvent.UnsubscribeSource,
      target_id: source.id,
    });

    displayToast(
      result.isSubscribed
        ? '✅ You are now subscribed'
        : '⛔️ You are now unsubscribed',
    );
  }, [isLoggedIn, onToggle, showLogin, source?.id, trackEvent, displayToast]);

  return {
    isSubscribed,
    isReady,
    onSubscribe,
  };
};
