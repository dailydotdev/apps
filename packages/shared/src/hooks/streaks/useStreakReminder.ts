import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { NotificationPreferenceStatus } from '../../graphql/notifications';
import { NotificationType } from '../../components/notifications/utils';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
} from '../../lib/log';
import useNotificationSettings from '../notifications/useNotificationSettings';
import { SendType, usePersonalizedDigest } from '../usePersonalizedDigest';

export const STREAK_REMINDER_HOUR = 20;

interface UseStreakReminder {
  isSubscribed: boolean;
  /** Both the reminder row and the notification flags have answered. */
  isReady: boolean;
  toggleStreakReminder: () => void;
  turnOffStreakReminder: () => Promise<void>;
}

const toggleLogExtra = JSON.stringify({
  channel: NotificationChannel.Web,
  category: NotificationCategory.StreakReminder,
});

export const useStreakReminder = (): UseStreakReminder => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { notificationSettings, setNotificationStatus, isLoadingPreferences } =
    useNotificationSettings();
  const {
    getPersonalizedDigest,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
    isSettled,
  } = usePersonalizedDigest();

  const isMuted =
    notificationSettings?.[NotificationType.StreakReminder]?.inApp ===
    NotificationPreferenceStatus.Muted;
  const isSubscribed =
    !isMuted &&
    !!getPersonalizedDigest(UserPersonalizedDigestType.StreakReminder);

  // The one-tap opt-out from the push: removes the reminder row like the
  // settings switch and also mutes the in-app flag, so nothing sends another
  const turnOffStreakReminder = async () => {
    logEvent({
      event_name: LogEvent.DisableNotification,
      extra: toggleLogExtra,
    });

    if (notificationSettings && !isMuted) {
      setNotificationStatus(
        NotificationType.StreakReminder,
        'inApp',
        NotificationPreferenceStatus.Muted,
      );
    }

    await unsubscribePersonalizedDigest({
      type: UserPersonalizedDigestType.StreakReminder,
    });
  };

  const toggleStreakReminder = () => {
    const value = !isSubscribed;
    logEvent({
      event_name: value
        ? LogEvent.EnableNotification
        : LogEvent.DisableNotification,
      extra: toggleLogExtra,
    });

    if (!value) {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.StreakReminder,
      });
      return;
    }

    logEvent({
      event_name: LogEvent.ScheduleStreakReminder,
      extra: JSON.stringify({
        hour: STREAK_REMINDER_HOUR,
        timezone: user?.timezone,
      }),
    });

    if (isMuted) {
      setNotificationStatus(
        NotificationType.StreakReminder,
        'inApp',
        NotificationPreferenceStatus.Subscribed,
      );
    }

    subscribePersonalizedDigest({
      hour: STREAK_REMINDER_HOUR,
      sendType: SendType.Workdays,
      type: UserPersonalizedDigestType.StreakReminder,
    });
  };

  return {
    isSubscribed,
    isReady: isSettled && !isLoadingPreferences,
    toggleStreakReminder,
    turnOffStreakReminder,
  };
};
