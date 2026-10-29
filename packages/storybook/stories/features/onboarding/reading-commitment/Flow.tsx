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
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { FunnelStepType } from '@dailydotdev/shared/src/features/onboarding/types/funnel';
import { FunnelStepShell } from '../signupFunnel.mocks';
import type { Platform } from './NotificationPreview';
import { LockScreen } from './NotificationPreview';
import { PostStack } from './PostStack';
import { freshPushFor } from './freshPosts';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { ClockFormat } from './reminderTimes';
import {
  DEFAULT_REMINDER_TIME,
  clockOfTime,
  displayTime,
  hourOfTime,
  isFirstReminderToday,
  timeOfHour,
  usesTwelveHourClock,
} from './reminderTimes';
import {
  ReminderPicker,
  formatHour,
} from '@dailydotdev/shared/src/components/onboarding/FeedPatchy/ReminderPicker';
import type { CheckboxItem } from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';
import {
  CheckboxGroupBehaviour,
  FormInputCheckboxGroup,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

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
  /** The tags the reader follows; the push preview shows a fresh post on one. */
  tags?: string[];
  /**
   * Set when the flow runs as the funnel's reading-reminder step: the shell
   * comes from FunnelStepper, and the reminder answer hands back to it.
   */
  onFinish?: () => void;
  /**
   * "5:00 PM" or "17:00". Auto reads it from the time zone: 12-hour in the
   * US and the other AM/PM regions, 24-hour everywhere else.
   */
  clock?: ClockFormat;
}

const TODAY_OPTIONS: CheckboxItem[] = [
  {
    value: '0',
    label: 'Barely anything',
  },
  {
    value: '5',
    label: 'A post or two',
    hint: '~5 min',
  },
  {
    value: '15',
    label: 'About 15 minutes',
    hint: '~15 min',
  },
  {
    value: '30',
    label: '30 minutes or more',
    hint: '30+ min',
  },
];

/** The goal top developers pick most. Placeholder: no data backs it yet. */
const TOP_GOAL = '15';
const TOP_GOAL_BADGE = 'Top developers pick this';

const GOAL_OPTIONS: CheckboxItem[] = [
  {
    value: '5',
    label: 'A quick catch-up',
    hint: '5 min',
  },
  {
    value: '10',
    label: 'One good read',
    hint: '10 min',
  },
  {
    value: '15',
    label: 'A steady habit',
    hint: '15 min',
  },
  {
    value: '30',
    label: 'Deep learning',
    hint: '30 min',
  },
].map((option) =>
  option.value === TOP_GOAL ? { ...option, badge: TOP_GOAL_BADGE } : option,
);

/** The reminder picker's own presets, same order and hours. */
const TIME_PRESETS = [
  { hour: 9, label: 'Morning' },
  { hour: 12, label: 'Lunch' },
  { hour: 17, label: 'Evening' },
];

const CUSTOM_TIME = 'custom';
// Where the Custom time row takes the ruler before any hour was dragged to.
const DEFAULT_CUSTOM_HOUR = 20;

const isPresetHour = (hour: number): boolean =>
  TIME_PRESETS.some((preset) => preset.hour === hour);

const timeOptions = (hour: number, isTwelveHour: boolean): CheckboxItem[] => {
  const isCustom = !isPresetHour(hour);
  const customTime = formatHour(hour, isTwelveHour);

  return [
    ...TIME_PRESETS.map(({ hour: presetHour, label }) => ({
      value: String(presetHour),
      label,
      hint: formatHour(presetHour, isTwelveHour),
    })),
    {
      value: CUSTOM_TIME,
      label: 'Custom time',
      hint: isCustom ? customTime : 'Any hour',
    },
  ];
};

const DEFAULT_TIME = DEFAULT_REMINDER_TIME.value;

/** The tags a new account starts with, as the playground seeds them. */
const SAMPLE_TAGS = ['javascript', 'react', 'devops', 'ai', 'webdev'];

// The card's preset row is hidden: the list under the card taps the ruler
// instead, so it glides to the hour as it does in production.
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

const PushPreview = ({
  platform,
  tags,
  time,
  isTwelveHour,
}: {
  platform: Platform;
  tags: string[];
  time: string;
  isTwelveHour: boolean;
}): ReactElement => (
  <LockScreen
    platform={platform}
    {...clockOfTime(time, isTwelveHour)}
    date={longDate(isFirstReminderToday(time) ? new Date() : addDays(1))}
    notifications={[{ ...freshPushFor(tags), when: 'now' }]}
  />
);

/** Feedback on a pick: where most readers are, and where it's worth being. */
const TODAY_FEEDBACK: Record<string, string> = {
  '0': 'Most developers start here. A few minutes a day is all it takes to catch up.',
  '5': 'That’s where most developers are. Small reads add up fast.',
  '15': 'You’re ahead of most developers. Let’s turn it into a habit.',
  '30': 'You read more than most developers. Let’s keep it that way.',
};

// Points back to the goal the list marks as the top developers' pick.
const GOAL_FEEDBACK: Record<string, string> = {
  '5': 'A solid start. Top developers build up to 15 minutes once it sticks.',
  '10': 'Close to the top. Most top developers read 15 minutes a day.',
  '15': 'Right where top developers are: enough to stay current, short enough for a busy day.',
  '30': 'Ahead of most top developers. Best with a set time for it.',
};

const feedbackCss = `
@keyframes rc-feedback {
  from { opacity: 0; transform: translateY(0.375rem); }
}
.rc-feedback { animation: rc-feedback 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-feedback { animation: none; }
}
`;

const PickFeedback = ({ text }: { text?: string }): ReactElement | null =>
  text ? (
    <p
      key={text}
      role="status"
      className="rc-feedback flex w-full items-start gap-2 rounded-16 bg-surface-float px-4 py-3 text-text-secondary typo-callout"
    >
      <style>{feedbackCss}</style>
      <VIcon
        aria-hidden
        size={IconSize.Small}
        className="mt-0.5 shrink-0 text-accent-avocado-default"
      />
      {text}
    </p>
  ) : null;

export const Flow = ({
  platform,
  startAt,
  tags = SAMPLE_TAGS,
  onFinish,
  clock = 'auto',
}: FlowProps): ReactElement => {
  const isSampled = !!startAt;
  const [index, setIndex] = useState(isSampled ? SCREENS.indexOf(startAt) : 0);
  const [today, setToday] = useState<string | undefined>(
    isSampled ? '5' : undefined,
  );
  // The goal screen opens with nothing picked, even as a sample.
  const [goal, setGoal] = useState<string | undefined>(
    isSampled && startAt !== 'goal' ? '15' : undefined,
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
  const isTwelveHour = usesTwelveHourClock(clock, timezone);
  const reminderLabel = displayTime(reminderTime, isTwelveHour);
  const lastCustomHour = useRef(DEFAULT_CUSTOM_HOUR);
  const timeValue = isPresetHour(reminderHour)
    ? String(reminderHour)
    : CUSTOM_TIME;

  // Taps the production ruler on the hour's tick, so it glides there and
  // reports the hour back as a tap of its own would.
  const glideTo = (hour: number) => {
    const slider =
      timePicker.current?.querySelector<HTMLElement>('[role="slider"]');
    // The ruler's first child is a spacer; each tick after it is an hour.
    const tick = slider?.children[hour + 1];
    if (!slider || !tick) {
      return;
    }
    const { left, width } = tick.getBoundingClientRect();
    slider.dispatchEvent(
      new MouseEvent('click', { bubbles: true, clientX: left + width / 2 }),
    );
  };

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
            <div className="flex w-full flex-col gap-4">
              <RadioList
                name="today"
                options={TODAY_OPTIONS}
                value={today}
                onChange={setToday}
              />
              <PickFeedback text={today && TODAY_FEEDBACK[today]} />
            </div>
          </StepScreen>
        );
      case 'goal':
        return (
          <StepScreen
            headline="Set your daily goal"
            subheadline="Pick a goal you can keep on a busy day."
            cta="Continue"
            isCtaDisabled={!goal}
            onCta={next}
          >
            <div className="flex w-full flex-col gap-4">
              <PostStack minutes={Number(goal ?? 0)} />
              <RadioList
                name="goal"
                options={GOAL_OPTIONS}
                value={goal}
                onChange={setGoal}
              />
              <PickFeedback text={goal && GOAL_FEEDBACK[goal]} />
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
                  onChange={(hour) => {
                    setTime(timeOfHour(hour));
                    if (!isPresetHour(hour)) {
                      lastCustomHour.current = hour;
                    }
                  }}
                  timezone={timezone}
                  onTimezoneChange={setTimezone}
                  isTwelveHour={isTwelveHour}
                />
              </div>
              <RadioList
                name="time"
                options={timeOptions(reminderHour, isTwelveHour)}
                value={timeValue}
                onChange={(value) =>
                  glideTo(
                    value === CUSTOM_TIME
                      ? lastCustomHour.current
                      : Number(value),
                  )
                }
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
              tags={tags}
              time={reminderTime}
              isTwelveHour={isTwelveHour}
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
