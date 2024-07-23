import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ClickableText } from '../../buttons/ClickableText';
import { Radio } from '../../fields/Radio';
import Alert, { AlertParagraph, AlertType } from '../../widgets/Alert';
import { Button, ButtonVariant } from '../../buttons/Button';
import { usePushNotificationMutation } from '../../../hooks/notifications';
import {
  LogEvent,
  NotificationPromptSource,
  TargetType,
} from '../../../lib/log';
import { usePersonalizedDigest } from '../../../hooks';
import { UserPersonalizedDigestType } from '../../../graphql/users';
import { TimezoneDropdown } from '../../widgets/TimezoneDropdown';
import LogContext from '../../../contexts/LogContext';
import AuthContext from '../../../contexts/AuthContext';
import { getUserInitialTimezone } from '../../../lib/timezones';
import { HourDropdown } from '../../fields/HourDropdown';

const ReadingReminderOptions = [
  { label: '09:00 ☕️', value: '9' },
  { label: '12:00 🥪', value: '12' },
  { label: '17:00 🛋️', value: '17' },
  { label: 'Custom️', value: 'custom' },
];

interface ReadingReminderProps {
  onClickNext: () => void;
}
export const ReadingReminder = ({
  onClickNext,
}: ReadingReminderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { logEvent } = useContext(LogContext);
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
    onClickNext();
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

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <p className="text-center typo-mega1">⏰</p>
        <h2 className="typo-bold text-center typo-large-title">
          When do you need that reading nudge?
        </h2>
        <p className="text-center text-text-quaternary typo-callout">
          Your timezone: {userTimeZone}{' '}
          {isEditingTimezone ? (
            <TimezoneDropdown
              userTimeZone={userTimeZone}
              setUserTimeZone={setUserTimeZone}
            />
          ) : (
            <ClickableText
              className="ml-3 inline-flex"
              onClick={() => setIsEditingTimezone(true)}
            >
              edit timezone
            </ClickableText>
          )}
        </p>
      </div>
      <Radio
        className={{ container: 'mt-4 tablet:mt-10' }}
        name="reading_reminder"
        value={timeOption}
        options={ReadingReminderOptions}
        onChange={(value) => setTimeOption(value)}
      />
      {timeOption === 'custom' && (
        <HourDropdown
          hourIndex={customTimeIndex}
          setHourIndex={setCustomTimeIndex}
          className={{ container: 'mt-3' }}
        />
      )}
      <Alert
        className="mt-4 tablet:mt-10"
        title="Consistency pays off."
        type={AlertType.Success}
      >
        <AlertParagraph className="text-text-secondary">
          Devs who enable notifications build a habit and become more
          knowledgeable
        </AlertParagraph>
      </Alert>
      <div className="mt-4 flex w-full flex-col-reverse gap-3 tablet:mt-10 tablet:w-auto tablet:flex-row tablet:gap-5">
        <Button onClick={onSkip} variant={ButtonVariant.Secondary}>
          I&apos;ll do it later
        </Button>
        <Button
          onClick={onSubmit}
          variant={ButtonVariant.Primary}
          loading={loading}
        >
          Submit
        </Button>
      </div>
    </>
  );
};
