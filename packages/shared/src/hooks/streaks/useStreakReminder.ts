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

const STREAK_REMINDER_HOUR = 20;

interface UseStreakReminder {
  isSubscribed: boolean;
  toggleStreakReminder: () => void;
}

export const useStreakReminder = (): UseStreakReminder => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const { notificationSettings, setNotificationStatus } =
    useNotificationSettings();
  const {
    getPersonalizedDigest,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();

  const isMuted =
    notificationSettings?.[NotificationType.StreakReminder]?.inApp ===
    NotificationPreferenceStatus.Muted;
  const isSubscribed =
    !isMuted &&
    !!getPersonalizedDigest(UserPersonalizedDigestType.StreakReminder);

  const toggleStreakReminder = () => {
    const value = !isSubscribed;
    logEvent({
      event_name: value
        ? LogEvent.EnableNotification
        : LogEvent.DisableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.StreakReminder,
      }),
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

  return { isSubscribed, toggleStreakReminder };
};
