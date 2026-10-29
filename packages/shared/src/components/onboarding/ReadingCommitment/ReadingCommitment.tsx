import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '../../../features/onboarding/shared/FunnelStepCtaWrapper';
import { OnboardingHeadline, OnboardingSubheadline } from '../common';
import type { CheckboxItem } from '../../../features/common/components/FormInputCheckboxGroup';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '../../../features/common/components/FormInputCheckboxGroup';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { VIcon } from '../../icons/V';
import { IconSize } from '../../Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent } from '../../../lib/log';
import {
  getHourTimezone,
  getUserInitialTimezone,
} from '../../../lib/timezones';
import type { ReminderPickerHandle } from '../FeedPatchy/ReminderPicker';
import { formatHour, ReminderPicker } from '../FeedPatchy/ReminderPicker';
import { ReEnableNotifications } from '../FeedPatchy/ReEnableNotifications';
import type { ReminderOutcome } from '../FeedPatchy/useFeedPatchyReminder';
import { useFeedPatchyReminder } from '../FeedPatchy/useFeedPatchyReminder';
import { PostStack } from './PostStack';
import type { ReminderPush } from './ReminderPreview';
import { getPreviewPlatform, ReminderPreview } from './ReminderPreview';
import { clockOfHour, isTwelveHourClock } from './regionalClock';
import styles from './ReadingCommitment.module.css';

/** Names this arm in every event, next to the control and Feed Patchy. */
const VARIANT = 'reading_commitment';

enum Screen {
  Today = 'today',
  Goal = 'goal',
  Time = 'time',
  Commit = 'commit',
}

const SCREENS = [Screen.Today, Screen.Goal, Screen.Time, Screen.Commit];

const TODAY_OPTIONS: CheckboxItem[] = [
  { value: '0', label: 'Barely anything' },
  { value: '5', label: 'A post or two', hint: '~5 min' },
  { value: '15', label: 'About 15 minutes', hint: '~15 min' },
  { value: '30', label: '30 minutes or more', hint: '30+ min' },
];

const RECOMMENDED_GOAL = '15';

const GOAL_OPTIONS: CheckboxItem[] = [
  { value: '5', label: 'A quick catch-up', hint: '5 min' },
  { value: '10', label: 'One good read', hint: '10 min' },
  {
    value: RECOMMENDED_GOAL,
    label: 'A steady habit',
    hint: '15 min',
    badge: 'Recommended',
  },
  { value: '30', label: 'Deep learning', hint: '30 min' },
];

const TODAY_FEEDBACK: Record<string, string> = {
  '0': 'Everyone starts somewhere. A few minutes a day is all it takes.',
  '5': 'A great base. Small reads add up fast.',
  '15': 'Nice. Let’s turn it into a daily habit.',
  '30': 'You already read a lot. Let’s keep it going.',
};

const GOAL_FEEDBACK: Record<string, string> = {
  '5': 'A solid start. You can raise it once it sticks.',
  '10': 'One good read a day keeps you current.',
  '15': 'Enough to stay current, short enough for a busy day.',
  '30': 'Ambitious. A set time makes it stick.',
};

/** The reminder picker's own presets, as a list under it. */
const TIME_PRESETS = [
  { hour: 9, label: 'Morning' },
  { hour: 12, label: 'Lunch' },
  { hour: 17, label: 'Evening' },
];

const DEFAULT_HOUR = TIME_PRESETS[0].hour;
const CUSTOM_TIME = 'custom';
// Where "Custom time" takes the ruler before any hour was dragged to.
const DEFAULT_CUSTOM_HOUR = 20;

const isPresetHour = (hour: number): boolean =>
  TIME_PRESETS.some((preset) => preset.hour === hour);

const timeOptions = (hour: number, isTwelveHour: boolean): CheckboxItem[] => [
  ...TIME_PRESETS.map((preset) => ({
    value: String(preset.hour),
    label: preset.label,
    hint: formatHour(preset.hour, isTwelveHour),
  })),
  {
    value: CUSTOM_TIME,
    label: 'Custom time',
    hint: isPresetHour(hour) ? 'Any hour' : formatHour(hour, isTwelveHour),
  },
];

const longDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

/**
 * A fixed showcase rather than the reader's own feed, so the preview always
 * shows sources every developer knows and a headline worth tapping.
 */
const LOGO_URL =
  'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos';
const SHOWCASE_LOGOS = [
  `${LOGO_URL}/hn`, // Hacker News
  `${LOGO_URL}/984b3632316f4afaa3d5213d5c64fe65`, // OpenAI
  `${LOGO_URL}/106cf162b88840808484d4b5429b59b1`, // GitHub
];

/** The reading reminder push as daily-api sends it, with a top pick. */
const SHOWCASE_PUSH: ReminderPush = {
  title: 'Top pick for you',
  body: 'Why Shopify Migrated From React Native',
};

const AnswerList = ({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: CheckboxItem[];
  value?: string;
  onChange: (value: string) => void;
}): ReactElement => (
  <div className="w-full">
    <FormInputCheckboxGroup
      behaviour={CheckboxGroupBehaviour.Radio}
      hasSelectionMark
      name={name}
      value={value ? [value] : []}
      onValueChange={(input) => {
        const picked = input.at(-1);
        if (picked) {
          onChange(picked);
        }
      }}
      options={options}
    />
  </div>
);

const PickFeedback = ({ text }: { text?: string }): ReactElement | null =>
  text ? (
    <p
      key={text}
      role="status"
      className={classNames(
        styles.rise,
        'flex w-full items-start gap-2 rounded-16 bg-surface-float px-4 py-3 text-text-secondary typo-callout',
      )}
    >
      <VIcon
        aria-hidden
        size={IconSize.Small}
        className="mt-0.5 shrink-0 text-accent-avocado-default"
      />
      {text}
    </p>
  ) : null;

/** One screen of the step: headline, subheadline, body, glass CTA. */
const CommitmentScreen = ({
  headline,
  subheadline,
  cta,
  isCtaDisabled,
  isLoading,
  onCta,
  onBack,
  docked,
  children,
}: {
  headline: string;
  subheadline: string;
  cta: string;
  isCtaDisabled?: boolean;
  isLoading?: boolean;
  onCta: () => void;
  onBack?: () => void;
  docked?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <FunnelStepCtaWrapper
    isGlass
    cta={{ label: cta }}
    disabled={isCtaDisabled}
    loading={isLoading}
    onClick={onCta}
    onBack={onBack}
    docked={docked}
    containerClassName="flex w-full flex-1 flex-col"
  >
    <div
      className={classNames(
        funnelStepRail,
        'flex flex-1 flex-col items-center gap-6 pb-6 pt-3',
      )}
    >
      <div className="flex w-full flex-col items-center gap-3">
        <OnboardingHeadline
          // Balanced so a two-line headline never leaves one word alone.
          style={{ textWrap: 'balance' } as CSSProperties}
        >
          {headline}
        </OnboardingHeadline>
        <OnboardingSubheadline>{subheadline}</OnboardingSubheadline>
      </div>
      {children}
    </div>
  </FunnelStepCtaWrapper>
);

/**
 * The reading commitment: how much the reader reads today, a daily goal, a
 * reminder time, then the push exactly as it will land before notifications
 * go on. Saves the reminder and asks for push as Feed Patchy does.
 */
export const ReadingCommitment = ({
  onComplete,
}: {
  onComplete: () => void;
}): ReactElement => {
  const reminder = useFeedPatchyReminder(VARIANT);
  const { logEvent } = useLogContext();
  const { user } = useAuthContext();
  const [platform] = useState(getPreviewPlatform);
  const [screenIndex, setScreenIndex] = useState(0);
  const [today, setToday] = useState<string>();
  const [goal, setGoal] = useState<string>();
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [pickedTimezone, setTimezone] = useState<string>();
  // As the control's reminder step: the profile's zone, else London. Read
  // live until one is picked.
  const timezone =
    pickedTimezone ??
    getUserInitialTimezone({ userTimezone: user?.timezone, update: true });
  const [isPrompting, setIsPrompting] = useState(false);
  const [outcome, setOutcome] = useState<ReminderOutcome>();
  const picker = useRef<ReminderPickerHandle>(null);
  const lastCustomHour = useRef(DEFAULT_CUSTOM_HOUR);
  const screen = SCREENS[screenIndex];
  const [isTwelveHour] = useState(isTwelveHourClock);
  const goalMinutes = Number(goal ?? RECOMMENDED_GOAL);

  const next = () => setScreenIndex((index) => index + 1);

  const back = () => setScreenIndex((index) => Math.max(index - 1, 0));

  const isToday = hour > getHourTimezone(timezone);
  const firstReminder = new Date();
  if (!isToday) {
    firstReminder.setDate(firstReminder.getDate() + 1);
  }

  const onCommitGoal = () => {
    logEvent({
      event_name: LogEvent.CommitOnboarding,
      extra: JSON.stringify({
        today_minutes: Number(today),
        goal_minutes: goalMinutes,
        variant: VARIANT,
      }),
    });
    next();
  };

  const onTurnOn = async () => {
    if (outcome === 'denied') {
      onComplete();
      return;
    }
    setIsPrompting(true);
    // The time is saved before the ask, so a failed ask still leaves it.
    const answer = await reminder
      .onSchedule(hour, timezone)
      .catch((): ReminderOutcome => 'dismissed');
    setIsPrompting(false);
    if (answer === 'denied') {
      setOutcome(answer);
      return;
    }
    onComplete();
  };

  const onSkip = () => {
    reminder.onSkip();
    onComplete();
  };

  const content = (() => {
    switch (screen) {
      case Screen.Today:
        return (
          <CommitmentScreen
            headline="Your daily tech reading"
            subheadline="How much do you read on a typical day? There’s no wrong answer."
            cta="Continue"
            isCtaDisabled={!today}
            onCta={next}
          >
            <div className="flex w-full flex-col gap-4">
              <AnswerList
                name="reading_today"
                options={TODAY_OPTIONS}
                value={today}
                onChange={setToday}
              />
              <PickFeedback text={today && TODAY_FEEDBACK[today]} />
            </div>
          </CommitmentScreen>
        );
      case Screen.Goal:
        return (
          <CommitmentScreen
            headline="Set your daily goal"
            subheadline="Pick a goal you can keep on a busy day."
            cta="Continue"
            isCtaDisabled={!goal}
            onCta={onCommitGoal}
            onBack={back}
          >
            <div className="flex w-full flex-col gap-4">
              <PostStack minutes={Number(goal ?? 0)} logos={SHOWCASE_LOGOS} />
              <AnswerList
                name="reading_goal"
                options={GOAL_OPTIONS}
                value={goal}
                onChange={setGoal}
              />
              <PickFeedback text={goal && GOAL_FEEDBACK[goal]} />
            </div>
          </CommitmentScreen>
        );
      case Screen.Time:
        return (
          <CommitmentScreen
            headline="When do you read?"
            subheadline="We’ll save your daily read for then."
            cta="Continue"
            onCta={next}
            onBack={back}
          >
            <div className="flex w-full flex-col gap-4">
              <ReminderPicker
                ref={picker}
                hour={hour}
                onChange={(picked) => {
                  setHour(picked);
                  if (!isPresetHour(picked)) {
                    lastCustomHour.current = picked;
                  }
                }}
                timezone={timezone}
                onTimezoneChange={setTimezone}
                isTwelveHour={isTwelveHour}
                hasPresets={false}
              />
              <AnswerList
                name="reading_time"
                options={timeOptions(hour, isTwelveHour)}
                value={isPresetHour(hour) ? String(hour) : CUSTOM_TIME}
                onChange={(value) =>
                  picker.current?.goTo(
                    value === CUSTOM_TIME
                      ? lastCustomHour.current
                      : Number(value),
                  )
                }
              />
            </div>
          </CommitmentScreen>
        );
      default:
        return (
          <CommitmentScreen
            headline={
              outcome === 'denied'
                ? 'Notifications are off'
                : 'Turn on your reminder'
            }
            subheadline={
              outcome === 'denied'
                ? `Your ${formatHour(
                    hour,
                    isTwelveHour,
                  )} reminder is saved. Turn notifications on to get it.`
                : `One notification at ${formatHour(
                    hour,
                    isTwelveHour,
                  )} to help you read ${goalMinutes} minutes a day.`
            }
            cta={outcome === 'denied' ? 'Continue' : 'Turn on notifications'}
            isLoading={isPrompting}
            onCta={onTurnOn}
            onBack={isPrompting ? undefined : back}
            docked={
              outcome !== 'denied' && (
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Medium}
                  onClick={onSkip}
                  disabled={isPrompting}
                  className="w-full"
                >
                  Skip for now
                </Button>
              )
            }
          >
            {outcome === 'denied' ? (
              <ReEnableNotifications />
            ) : (
              <ReminderPreview
                platform={platform}
                {...clockOfHour(hour, isTwelveHour)}
                date={longDate(firstReminder)}
                push={SHOWCASE_PUSH}
              />
            )}
          </CommitmentScreen>
        );
    }
  })();

  return (
    // Keyed so each screen mounts fresh, as funnel steps do.
    <div key={screen} className="flex w-full flex-1 flex-col">
      {content}
    </div>
  );
};
