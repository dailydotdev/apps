import { useCallback, useEffect } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import usePersistentContext from '../usePersistentContext';
import {
  AnalyticsEvent,
  NotificationPromptSource,
  TargetType,
} from '../../lib/analytics';
import { useAcceptedPushNow } from './useAcceptedPushNow';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
}

interface UseEnableNotification {
  shouldShowCta: boolean;
  onDismiss: () => void;
  onEnable: () => Promise<boolean>;
}

export const useEnableNotification = ({
  source = NotificationPromptSource.NotificationsPage,
}: UseEnableNotificationProps): UseEnableNotification => {
  const { trackEvent } = useAnalyticsContext();
  const { isInitialized, isPushSupported, isSubscribed } =
    usePushNotificationContext();
  const { hasPermissionCache, onEnablePush } = usePushNotificationMutation();
  const { acceptedJustNow } = useAcceptedPushNow();
  const [isDismissed, setIsDismissed, isLoaded] = usePersistentContext(
    DISMISS_PERMISSION_BANNER,
    false,
  );
  const onDismiss = () => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationDismiss,
      extra: JSON.stringify({ origin: source }),
    });
    setIsDismissed(true);
  };

  const onEnable = useCallback(
    () => onEnablePush(source),
    [source, onEnablePush],
  );

  const hasEnabled = (isSubscribed || hasPermissionCache) && acceptedJustNow;

  const conditions = [
    !isLoaded,
    isDismissed,
    !isInitialized,
    !isPushSupported,
    (isSubscribed || hasPermissionCache) && !acceptedJustNow,
    hasEnabled && source === NotificationPromptSource.SquadPostModal,
  ];
  const shouldShowCta = !conditions.some((passed) => passed);

  useEffect(() => {
    if (!shouldShowCta) {
      return;
    }

    trackEvent({
      event_name: AnalyticsEvent.Impression,
      target_type: TargetType.EnableNotifications,
      extra: JSON.stringify({ origin: source }),
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowCta]);

  return {
    shouldShowCta,
    onDismiss,
    onEnable,
  };
};
