import { useContext, useEffect } from 'react';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import NotificationsContext from '../contexts/NotificationsContext';
import usePersistentContext from './usePersistentContext';
import {
  AnalyticsEvent,
  NotificationPromptSource,
  TargetType,
} from '../lib/analytics';
import { useActions } from './useActions';
import { ActionType } from '../graphql/actions';

export const DISMISS_PERMISSION_BANNER = 'DISMISS_PERMISSION_BANNER';

interface UseEnableNotificationProps {
  source: NotificationPromptSource;
}

interface UseEnableNotification {
  isEnabled: boolean;
  hasEnabled: boolean;
  shouldShowCta: boolean;
  onDismiss: () => void;
  onEnable: () => Promise<void>;
}

export const useEnableNotification = ({
  source = NotificationPromptSource.NotificationsPage,
}: UseEnableNotificationProps): UseEnableNotification => {
  const { completeAction } = useActions();
  const { trackEvent } = useAnalyticsContext();
  const {
    isInitialized,
    isSubscribed,
    isNotificationSupported,
    hasPermissionCache,
    acceptedPermissionJustNow: isEnabled,
    onAcceptedPermissionJustNow,
    onTogglePermission,
  } = useContext(NotificationsContext);
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

  const onEnable = async () => {
    const permission = await onTogglePermission(source);

    if (permission === null) {
      return;
    }

    const isGranted = permission === 'granted';

    onAcceptedPermissionJustNow?.(isGranted);

    if (isGranted) {
      completeAction(ActionType.EnableNotification);
    }
  };

  const hasEnabled = (isSubscribed || hasPermissionCache) && isEnabled;

  const conditions = [
    !isLoaded,
    isDismissed,
    !isInitialized,
    !isNotificationSupported,
    (isSubscribed || hasPermissionCache) && !isEnabled,
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

  useEffect(() => {
    return () => {
      if (onAcceptedPermissionJustNow) {
        onAcceptedPermissionJustNow(false);
      }
    };
  }, [onAcceptedPermissionJustNow]);

  return {
    isEnabled,
    hasEnabled,
    shouldShowCta,
    onDismiss,
    onEnable,
  };
};
