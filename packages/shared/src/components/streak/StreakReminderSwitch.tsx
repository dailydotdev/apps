import React, { ReactElement } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { SendType, usePersonalizedDigest } from '../../hooks';
import { usePushNotificationMutation } from '../../hooks/notifications';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
  NotificationPromptSource,
} from '../../lib/log';
import { Switch } from '../fields/Switch';

interface StreakReminderSwitchProps {
  className?: string;
}
const StreakReminderSwitch = ({
  className,
}: StreakReminderSwitchProps): ReactElement => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
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
    logEvent({
      event_name: value
        ? LogEvent.EnableNotification
        : LogEvent.DisableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.StreakReminder,
      }),
    });

    if (value) {
      logEvent({
        event_name: LogEvent.ScheduleStreakReminder,
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
      data-testid="streak-reminder-switch"
      inputId="streak-reminder-switch"
      name="streak-reminder"
      defaultTypo
      className={className}
      labelClassName="font-bold"
      compact={false}
      onToggle={onToggleStreakReminder}
    >
      Remind me to keep my streak
    </Switch>
  );
};
export default StreakReminderSwitch;
