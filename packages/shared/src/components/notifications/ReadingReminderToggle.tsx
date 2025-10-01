import React from 'react';
import { UserPersonalizedDigestType } from '../../graphql/users';
import {
  SendType,
  usePersonalizedDigest,
} from '../../hooks/usePersonalizedDigest';
import NotificationSwitch from './NotificationSwitch';
import { HourDropdown } from '../fields/HourDropdown';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { useLogContext } from '../../contexts/LogContext';
import {
  LogEvent,
  NotificationCategory,
  NotificationChannel,
} from '../../lib/log';
import { useAuthContext } from '../../contexts/AuthContext';

const ReadingReminderToggle = () => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const {
    getPersonalizedDigest,
    subscribePersonalizedDigest,
    unsubscribePersonalizedDigest,
  } = usePersonalizedDigest();
  const readingReminder = getPersonalizedDigest(
    UserPersonalizedDigestType.ReadingReminder,
  );

  const toggleSubscription = () => {
    if (readingReminder) {
      unsubscribePersonalizedDigest({
        type: UserPersonalizedDigestType.ReadingReminder,
      });
    } else {
      subscribePersonalizedDigest({
        type: UserPersonalizedDigestType.ReadingReminder,
        sendType: SendType.Daily,
        hour: 8,
      });
    }

    logEvent({
      event_name: readingReminder
        ? LogEvent.DisableNotification
        : LogEvent.EnableNotification,
      extra: JSON.stringify({
        channel: NotificationChannel.Web,
        category: NotificationCategory.ReadingReminder,
      }),
    });
  };

  const handleSetHour = (hour: number) => {
    logEvent({
      event_name: LogEvent.ScheduleReadingReminder,
      extra: JSON.stringify({
        hour,
        timezone: user?.timezone,
        frequency: SendType.Daily,
      }),
    });

    subscribePersonalizedDigest({
      type: UserPersonalizedDigestType.ReadingReminder,
      sendType: SendType.Daily,
      hour,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <NotificationSwitch
          id="reading-reminder"
          label="What's the ideal time to send you a reading reminder?"
          checked={!!readingReminder}
          onToggle={toggleSubscription}
        />
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Footnote}
        >
          Developers who receive daily reading reminders are more likely to stay
          ahead of the curve.
        </Typography>
      </div>
      {!!readingReminder && (
        <HourDropdown
          className={{
            container: 'w-40',
          }}
          hourIndex={readingReminder?.preferredHour ?? 8}
          setHourIndex={(hour) => handleSetHour(hour)}
        />
      )}
    </div>
  );
};

export default ReadingReminderToggle;
