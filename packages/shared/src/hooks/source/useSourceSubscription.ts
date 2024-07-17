import { useCallback } from 'react';
import { NotificationType } from '../../components/notifications/utils';
import { useLogContext } from '../../contexts/LogContext';
import { useAuthContext } from '../../contexts/AuthContext';
import { Source } from '../../graphql/sources';
import { LogEvent } from '../../lib/log';
import { AuthTriggers } from '../../lib/auth';
import { useNotificationPreferenceToggle } from '../notifications';
import { useToastNotification } from '../useToastNotification';
import { useToggle } from '../useToggle';

export type UseSourceSubscriptionProps = {
  source: Pick<Source, 'id'>;
};

export type UseSourceSubscription = {
  haveNotifications: boolean;
  isFollowing: boolean;
  isReady: boolean;
  onFollowing: () => void;
  onNotify: () => Promise<void>;
};

export const useSourceSubscription = ({
  source,
}: UseSourceSubscriptionProps): UseSourceSubscription => {
  const { logEvent } = useLogContext();
  const { isLoggedIn, showLogin } = useAuthContext();
  const { displayToast } = useToastNotification();
  const [isFollowing, toggleFollow] = useToggle(false);
  const { haveNotifications, isReady, onToggle } =
    useNotificationPreferenceToggle({
      params: source?.id
        ? {
            notificationType: NotificationType.SourcePostAdded,
            referenceId: source?.id,
          }
        : undefined,
    });

  const onNotify = useCallback(async () => {
    if (!source?.id) {
      return;
    }

    if (!isLoggedIn) {
      showLogin({ trigger: AuthTriggers.SourceSubscribe });

      return;
    }

    const result = await onToggle();

    logEvent({
      event_name: result.isSubscribed
        ? LogEvent.SubscribeSource
        : LogEvent.UnsubscribeSource,
      target_id: source.id,
    });

    displayToast(
      result.isSubscribed
        ? '✅ You are now subscribed'
        : '⛔️ You are now unsubscribed',
    );
  }, [isLoggedIn, onToggle, showLogin, source?.id, logEvent, displayToast]);
  const onFollowing = useCallback(() => {
    toggleFollow();
  }, [isFollowing, toggleFollow]);

  return {
    isFollowing,
    haveNotifications,
    isReady,
    onFollowing,
    onNotify,
  };
};
