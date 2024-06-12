import React, { ReactElement } from 'react';
import { Switch } from '../fields/Switch';
import { SendType, usePersonalizedDigest } from '../../hooks';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { usePushNotificationMutation } from '../../hooks/notifications';
import {
  AnalyticsEvent,
  NotificationCategory,
  NotificationChannel,
  NotificationPromptSource,
} from '../../lib/analytics';
import { useAnalyticsContext } from '../../contexts/AnalyticsContext';
import { useAuthContext } from '../../contexts/AuthContext';

interface StreakReminderSwitchProps {
  className?: string;
}
const StreakReminderSwitch = ({
  className,
}: StreakReminderSwitchProps): ReactElement => {
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const { onEnablePush } = usePushNotificationMutation();
  const {
    getPersonalizedDigest,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();

  const streakReminder = getPersonalizedDigest(
    UserPersonalizedDigestType.StreakReminder,
  );

  const onToggleStreakReminder = () => {
    const value = !streakReminder;
    trackEvent({
      event_name: value
        ? AnalyticsEvent.EnableNotification
        : AnalyticsEvent.DisableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.StreakReminder,
      }),
    });

    if (value) {
      trackEvent({
        event_name: AnalyticsEvent.ScheduleStreakReminder,
        extra: JSON.stringify({
          hour: 20,
          timezone: user?.timezone,
        }),
      });
      subscribePersonalizedDigest({
        hour: 20,
        sendType: SendType.Workdays,
        type: UserPersonalizedDigestType.StreakReminder,
      });
      onEnablePush(NotificationPromptSource.ReadingReminder);
    } else {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.StreakReminder,
      });
    }
  };

  return (
    <Switch
      checked={!!streakReminder}
      data-testid="email_notification-switch"
      inputId="email_notification-switch"
      name="email_notification"
      defaultTypo
      className={className}
      labelClassName="font-bold"
      compact={false}
      onToggle={onToggleStreakReminder}
    >
      Streak reminder
    </Switch>
  );
};
export default StreakReminderSwitch;
