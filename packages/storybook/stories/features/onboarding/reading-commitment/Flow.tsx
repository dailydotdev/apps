import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import {
  FunnelStepCtaWrapper,
  funnelStepRail,
} from '@dailydotdev/shared/src/features/onboarding/shared/FunnelStepCtaWrapper';
import {
  OnboardingHeadline,
  OnboardingSubheadline,
} from '@dailydotdev/shared/src/components/onboarding/common';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepShell } from '../signupFunnel.mocks';
import type { Platform } from './NotificationPreview';
import { LockScreen } from './NotificationPreview';
import type { MinutesOption } from './PostStack';
import { PostStack } from './PostStack';
import {
  DEFAULT_REMINDER_TIME,
  clockOfTime,
  displayTime,
  hourOfTime,
  isFirstReminderToday,
  reminderTimeOf,
  timeOfHour,
} from './reminderTimes';
import {
  ReminderPicker,
  formatHour,
} from '@dailydotdev/shared/src/components/onboarding/FeedPatchy/ReminderPicker';

/**
 * A replacement for Feed Patchy: the user says how much they read today and
 * where they want to be, picks a reminder time, and sees the exact push
 * daily.dev will send before turning notifications on.
 *
 * Story-only. Every screen is built from the funnel's own pieces (glass CTA
 * bar, onboarding headline, the radio list the role and quiz steps use, the
 * production reminder picker).
 */

export type ScreenId = 'today' | 'goal' | 'time' | 'commit';

export interface FlowProps {
  /** Which phone the notification preview is drawn as. */
  platform: Platform;
  /** Opens the flow on this screen, with sample answers filled in. */
  startAt?: ScreenId;
  /**
   * Set when the flow runs as the funnel's reading-reminder step: the shell
   * comes from FunnelStepper, and the reminder answer hands back to it.
   */
  onFinish?: () => void;
}

const TODAY_OPTIONS: MinutesOption[] = [
  { value: '0', label: 'Barely anything' },
  { value: '5', label: 'A post or two', hint: '~5 min' },
  { value: '15', label: 'About 15 minutes', hint: '~15 min' },
  { value: '30', label: '30 minutes or more', hint: '30+ min' },
];

const GOAL_OPTIONS: MinutesOption[] = [
  { value: '5', label: 'A quick catch-up', hint: '5 min' },
  { value: '10', label: 'One good read', hint: '10 min' },
  { value: '15', label: 'A steady habit', hint: '15 min' },
  { value: '30', label: 'Deep learning', hint: '30 min' },
];

/** The reminder picker's own presets, same order and hours. */
const TIME_OPTIONS: MinutesOption[] = [
  { value: '9', label: 'Morning', hint: formatHour(9) },
  { value: '12', label: 'Lunch', hint: formatHour(12) },
  { value: '17', label: 'Evening', hint: formatHour(17) },
];

/**
 * The post stack always shows a goal. It starts at the reader's own level,
 * the smallest goal that isn't below what they read today.
 */
const goalStartFor = (today?: string): string =>
  (
    GOAL_OPTIONS.find(({ value }) => Number(value) >= Number(today ?? 0)) ??
    GOAL_OPTIONS[GOAL_OPTIONS.length - 1]
  ).value;

const DEFAULT_TIME = DEFAULT_REMINDER_TIME.value;

// The card's preset row stays in the DOM, hidden: the list under the card
// presses it, so the ruler glides to the hour as it does in production.
const timePickerCss = `
.rc-time-picker .uppercase { display: none; }
.rc-time-picker .uppercase + * { margin-inline: auto; }
.rc-time-picker .grid-cols-3 { display: none; }
`;

const STEP = { type: FunnelStepType.ReadingReminder, parameters: {} };
// Where the commitment sits in the signup funnel, so the dots read right.
const FIRST_STEP_INDEX = 2;

const SCREENS: ScreenId[] = ['today', 'goal', 'time', 'commit'];

const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const longDate = (date: Date): string =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

/** The funnel step chrome: headline, subheadline, body, glass CTA. */
const StepScreen = ({
  headline,
  subheadline,
  cta,
  isCtaDisabled,
  onCta,
  skip,
  docked,
  children,
}: {
  headline: ReactNode;
  subheadline?: ReactNode;
  cta: string;
  isCtaDisabled?: boolean;
  onCta: () => void;
  skip?: { cta: string; onClick: () => void };
  /** Sits right above the CTA in its rail, so it never scrolls away. */
  docked?: ReactNode;
  children?: ReactNode;
}): ReactElement => (
  <FunnelStepCtaWrapper
    isGlass
    cta={{ label: cta }}
    disabled={isCtaDisabled}
    onClick={onCta}
    skip={skip}
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
        {subheadline && (
          <OnboardingSubheadline>{subheadline}</OnboardingSubheadline>
        )}
      </div>
      {children}
    </div>
  </FunnelStepCtaWrapper>
);

const RadioList = ({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: MinutesOption[];
  value?: string;
  onChange: (value: string) => void;
}): ReactElement => (
  <div className="w-full">
    <FormInputCheckboxGroup
      behaviour={CheckboxGroupBehaviour.Radio}
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

const PushPreview = ({
  platform,
  goal,
  time,
}: {
  platform: Platform;
  goal: number;
  time: string;
}): ReactElement => (
  <LockScreen
    platform={platform}
    clock={clockOfTime(time)}
    date={longDate(isFirstReminderToday(time) ? new Date() : addDays(1))}
    notifications={[{ ...reminderTimeOf(time).push(goal), when: 'now' }]}
  />
);

export const Flow = ({
  platform,
  startAt,
  onFinish,
}: FlowProps): ReactElement => {
  const isSampled = !!startAt;
  const [index, setIndex] = useState(isSampled ? SCREENS.indexOf(startAt) : 0);
  const [today, setToday] = useState<string | undefined>(
    isSampled ? '5' : undefined,
  );
  const [goal, setGoal] = useState<string | undefined>(
    isSampled ? '15' : undefined,
  );
  const [time, setTime] = useState<string | undefined>(
    isSampled ? DEFAULT_TIME : undefined,
  );
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const screen = SCREENS[index];
  const next = () =>
    setIndex((current) => Math.min(current + 1, SCREENS.length - 1));
  const restart = () => {
    setIndex(0);
    setToday(undefined);
    setGoal(undefined);
    setTime(undefined);
    hasAnswered.current = false;
  };
  // The reminder screen takes one answer: once Turn on or Skip is tapped,
  // further taps on either do nothing. Either one ends the step; in the
  // story it starts over.
  const hasAnswered = useRef(false);
  const timePicker = useRef<HTMLDivElement>(null);
  const answer = () => {
    if (hasAnswered.current) {
      return;
    }
    hasAnswered.current = true;
    (onFinish ?? restart)();
  };
  const goalMinutes = Number(goal ?? 15);
  const reminderTime = time ?? DEFAULT_TIME;
  const reminderHour = hourOfTime(reminderTime);
  const reminderLabel = displayTime(reminderTime);
  const goalStart = goalStartFor(today);

  const content = (() => {
    switch (screen) {
      case 'today':
        return (
          <StepScreen
            headline="Your daily tech reading"
            subheadline="How much do you read on a typical day? There’s no wrong answer."
            cta="Continue"
            isCtaDisabled={!today}
            onCta={next}
          >
            <RadioList
              name="today"
              options={TODAY_OPTIONS}
              value={today}
              onChange={setToday}
            />
          </StepScreen>
        );
      case 'goal':
        return (
          <StepScreen
            headline="Set your daily goal"
            subheadline="Pick a goal you can keep on a busy day."
            cta="Continue"
            onCta={() => {
              setGoal(goal ?? goalStart);
              next();
            }}
          >
            <div className="flex w-full flex-col gap-4">
              <PostStack minutes={Number(goal ?? goalStart)} />
              <RadioList
                name="goal"
                options={GOAL_OPTIONS}
                value={goal ?? goalStart}
                onChange={setGoal}
              />
            </div>
          </StepScreen>
        );
      case 'time':
        return (
          <StepScreen
            headline="When do you read?"
            subheadline="We’ll save your daily read for then."
            cta="Continue"
            onCta={() => {
              setTime(time ?? timeOfHour(reminderHour));
              next();
            }}
          >
            <div className="flex w-full flex-col gap-4">
              <div ref={timePicker} className="rc-time-picker w-full">
                {/* Story-only: hides the production card’s "Daily reminder"
                    caption and presets, and centers its time zone link. */}
                <style>{timePickerCss}</style>
                <ReminderPicker
                  hour={reminderHour}
                  onChange={(hour) => setTime(timeOfHour(hour))}
                  timezone={timezone}
                  onTimezoneChange={setTimezone}
                />
              </div>
              <RadioList
                name="time"
                options={TIME_OPTIONS}
                value={String(reminderHour)}
                onChange={(hour) => {
                  const preset = TIME_OPTIONS.findIndex(
                    ({ value }) => value === hour,
                  );
                  timePicker.current
                    ?.querySelectorAll<HTMLButtonElement>('.grid-cols-3 button')
                    [preset]?.click();
                }}
              />
            </div>
          </StepScreen>
        );
      default:
        return (
          <StepScreen
            headline="Turn on your reminder"
            subheadline={`One notification at ${reminderLabel} to help you read ${goalMinutes} minutes a day.`}
            cta="Turn on notifications"
            onCta={answer}
            docked={
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Medium}
                onClick={answer}
                className="w-full"
              >
                Skip for now
              </Button>
            }
          >
            <PushPreview
              platform={platform}
              goal={goalMinutes}
              time={reminderTime}
            />
          </StepScreen>
        );
    }
  })();

  const screenView = (
    // Keyed so each screen mounts fresh, as funnel steps do.
    <div key={screen} className="flex flex-1 flex-col">
      {content}
    </div>
  );

  if (onFinish) {
    return screenView;
  }

  return (
    <FunnelStepShell step={STEP} stepIndex={FIRST_STEP_INDEX + index} fullWidth>
      {screenView}
    </FunnelStepShell>
  );
};
