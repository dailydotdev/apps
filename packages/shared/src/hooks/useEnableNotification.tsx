import { useCallback } from 'react';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import {
  NotificationsContextData,
  useNotificationContext,
} from '../contexts/NotificationsContext';
import { AnalyticsEvent } from '../lib/analytics';

export enum NotificationPromptSource {
  NotificationsPage = 'notifications page',
  NewComment = 'new comment',
  CommunityPicks = 'community picks modal',
  NewSourceModal = 'new source modal',
}

export const useEnableNotification = (
  source: NotificationPromptSource,
): NotificationsContextData['onTogglePermission'] => {
  const { trackEvent } = useAnalyticsContext();
  const { onTogglePermission } = useNotificationContext();

  return useCallback(async () => {
    const permission = await onTogglePermission();

    if (!permission) {
      return null;
    }

    trackEvent({
      event_name: AnalyticsEvent.ClickEnableNotification,
      extra: JSON.stringify({ origin: source, permission }),
    });

    return permission;
  }, [source, onTogglePermission]);
};
