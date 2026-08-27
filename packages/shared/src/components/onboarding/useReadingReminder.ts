import { useContext, useEffect, useRef, useState } from 'react';
import { usePushNotificationMutation } from '../../hooks/notifications';
import { LogEvent, NotificationPromptSource, TargetType } from '../../lib/log';
import { usePersonalizedDigest } from '../../hooks';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { useLogContext } from '../../contexts/LogContext';
import AuthContext from '../../contexts/AuthContext';
import { getUserInitialTimezone } from '../../lib/timezones';

interface UseReadingReminderProps {
  onClickNext: (options?: { skipped?: boolean }) => void;
}

export const useReadingReminder = ({
  onClickNext,
}: UseReadingReminderProps) => {
  const { user } = useContext(AuthContext);
  const { logEvent } = useLogContext();
  const [loading, setLoading] = useState(false);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );
  const [timeOption, setTimeOption] = useState('9');
  const [customTimeIndex, setCustomTimeIndex] = useState(8);
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const isLogged = useRef(false);
  const { onEnablePush } = usePushNotificationMutation();
  const { subscribePersonalizedDigest } = usePersonalizedDigest();

  useEffect(() => {
    if (!isLogged.current) {
      isLogged.current = true;
      logEvent({
        event_name: LogEvent.Impression,
        target_type: TargetType.ReadingReminder,
      });
    }
  }, [logEvent]);

  const onSkip = () => {
    logEvent({
      event_name: LogEvent.SkipReadingReminder,
    });
    onClickNext({ skipped: true });
  };

  const onSubmit = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    const selectedHour =
      timeOption === 'custom' ? customTimeIndex : parseInt(timeOption, 10);
    logEvent({
      event_name: LogEvent.ScheduleReadingReminder,
      extra: JSON.stringify({
        hour: selectedHour,
        timezone: userTimeZone,
      }),
    });
    subscribePersonalizedDigest({
      hour: selectedHour,
      type: UserPersonalizedDigestType.ReadingReminder,
    });
    onEnablePush(NotificationPromptSource.ReadingReminder).then(() => {
      onClickNext();
      setLoading(false);
    });
  };

  return {
    customTimeIndex,
    isEditingTimezone,
    loading,
    onSkip,
    onSubmit,
    setCustomTimeIndex,
    setIsEditingTimezone,
    setTimeOption,
    setUserTimeZone,
    timeOption,
    userTimeZone,
  };
};

export type ReadingReminderState = ReturnType<typeof useReadingReminder>;
