import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ClickableText } from '../buttons/ClickableText';
import { Radio } from '../fields/Radio';
import { Dropdown } from '../fields/Dropdown';
import Alert, { AlertParagraph, AlertType } from '../widgets/Alert';
import { Button, ButtonVariant } from '../buttons/Button';
import { useEnableNotification } from '../../hooks/notifications';
import {
  AnalyticsEvent,
  NotificationPromptSource,
  TargetType,
} from '../../lib/analytics';
import { usePersonalizedDigest } from '../../hooks';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { TimezoneDropdown } from '../widgets/TimezoneDropdown';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import AuthContext from '../../contexts/AuthContext';
import { getUserInitialTimezone } from '../../lib/timezones';

const ReadingReminderOptions = [
  { label: '09:00 ☕️', value: '9' },
  { label: '12:00 🥪', value: '12' },
  { label: '17:00 🛋️', value: '17' },
  { label: 'Custom️', value: 'custom' },
];

export const ReadingReminderTimes = [
  { value: 0, label: '00:00' },
  { value: 1, label: '01:00' },
  { value: 2, label: '02:00' },
  { value: 3, label: '03:00' },
  { value: 4, label: '04:00' },
  { value: 5, label: '05:00' },
  { value: 6, label: '06:00' },
  { value: 7, label: '07:00' },
  { value: 8, label: '08:00' },
  { value: 9, label: '09:00' },
  { value: 10, label: '10:00' },
  { value: 11, label: '11:00' },
  { value: 12, label: '12:00' },
  { value: 13, label: '13:00' },
  { value: 14, label: '14:00' },
  { value: 15, label: '15:00' },
  { value: 16, label: '16:00' },
  { value: 17, label: '17:00' },
  { value: 18, label: '18:00' },
  { value: 19, label: '19:00' },
  { value: 20, label: '20:00' },
  { value: 21, label: '21:00' },
  { value: 22, label: '22:00' },
  { value: 23, label: '23:00' },
];
const ReadingReminderTimeOptions = ReadingReminderTimes.map(
  (item) => item.label,
);

interface ReadingReminderProps {
  onClickNext: () => void;
}
export const ReadingReminder = ({
  onClickNext,
}: ReadingReminderProps): ReactElement => {
  const { user } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);
  const [userTimeZone, setUserTimeZone] = useState<string>(
    getUserInitialTimezone({
      userTimezone: user?.timezone,
      update: true,
    }),
  );
  const [timeOption, setTimeOption] = useState('9');
  const [customTimeIndex, setCustomTimeIndex] = useState(8);
  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const isTracked = useRef(false);
  const { onEnable } = useEnableNotification({
    source: NotificationPromptSource.ReadingReminder,
  });
  const { subscribePersonalizedDigest } = usePersonalizedDigest();

  useEffect(() => {
    if (!isTracked.current) {
      isTracked.current = true;
      trackEvent({
        event_name: AnalyticsEvent.Impression,
        target_type: TargetType.ReadingReminder,
      });
    }
  }, [trackEvent]);

  const onSkip = () => {
    trackEvent({
      event_name: AnalyticsEvent.SkipReadingReminder,
    });
    onClickNext();
  };

  const onSubmit = () => {
    const selectedHour =
      timeOption === 'custom'
        ? ReadingReminderTimes[customTimeIndex].value
        : parseInt(timeOption, 10);
    trackEvent({
      event_name: AnalyticsEvent.ScheduleReadingReminder,
      extra: JSON.stringify({
        hour: selectedHour,
        timezone: userTimeZone,
      }),
    });
    subscribePersonalizedDigest({
      hour: selectedHour,
      type: UserPersonalizedDigestType.ReadingReminder,
    });
    onEnable();
    onClickNext();
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
              className="ml-3 inline-flex !text-text-link"
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
        <Dropdown
          className={{ container: 'mt-3' }}
          selectedIndex={customTimeIndex}
          options={ReadingReminderTimeOptions}
          onChange={(_, index) => setCustomTimeIndex(index)}
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
        <Button onClick={onSubmit} variant={ButtonVariant.Primary}>
          Submit
        </Button>
      </div>
    </>
  );
};
