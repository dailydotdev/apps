import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '../fields/Switch';
import { usePushNotificationMutation } from '../../hooks/notifications/usePushNotificationMutation';
import { NotificationPromptSource } from '../../lib/log';
import { useStreakReminder } from '../../hooks/streaks/useStreakReminder';

interface StreakReminderSwitchProps {
  className?: string;
}
const StreakReminderSwitch = ({
  className,
}: StreakReminderSwitchProps): ReactElement => {
  const { onEnablePush } = usePushNotificationMutation();
  const { isSubscribed, toggleStreakReminder } = useStreakReminder();

  const onToggleStreakReminder = () => {
    toggleStreakReminder();

    if (!isSubscribed) {
      onEnablePush(NotificationPromptSource.ReadingReminder);
    }
  };

  return (
    <Switch
      checked={isSubscribed}
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
