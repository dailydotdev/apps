import { useCallback, useEffect } from 'react';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import usePersistentContext from '../usePersistentContext';
import {
  AnalyticsEvent,
  NotificationPromptSource,
  TargetType,
} from '../../lib/analytics';
import { usePushNotificationMutation } from './usePushNotificationMutation';
import { usePushNotificationContext } from '../../contexts/PushNotificationContext';
import { checkIsExtension } from '../../lib/func';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
}

interface UseEnableNotification {
  acceptedJustNow: boolean;
  shouldShowCta: boolean;
  onDismiss: () => void;
  onEnable: () => Promise<boolean>;
}

export const useEnableNotification = ({
  source = NotificationPromptSource.NotificationsPage,
}: UseEnableNotificationProps): UseEnableNotification => {
  const isExtension = checkIsExtension();
  const { trackEvent } = useAnalyticsContext();
  const { isInitialized, isPushSupported, isSubscribed, shouldOpenPopup } =
    usePushNotificationContext();
  const { hasPermissionCache, acceptedJustNow, onEnablePush } =
    usePushNotificationMutation();
  const [isDismissed, setIsDismissed, isLoaded] = usePersistentContext(
    DISMISS_PERMISSION_BANNER,
    false,
  );
  const onDismiss = useCallback(() => {
    trackEvent({
      event_name: AnalyticsEvent.ClickNotificationDismiss,
      extra: JSON.stringify({ origin: source }),
    });
    setIsDismissed(true);
  }, [source, trackEvent, setIsDismissed]);

  const onEnable = useCallback(
    () => onEnablePush(source),
    [source, onEnablePush],
  );

  const subscribed = isSubscribed || (shouldOpenPopup && hasPermissionCache);
  const enabledJustNow = subscribed && acceptedJustNow;

  const conditions = [
    isLoaded,
    !subscribed,
    !isDismissed,
    isInitialized,
    isPushSupported || isExtension,
  ];

  const shouldShowCta =
    conditions.every(Boolean) ||
    (enabledJustNow && source !== NotificationPromptSource.SquadPostModal);

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
    acceptedJustNow,
    shouldShowCta,
    onDismiss,
    onEnable,
  };
};
