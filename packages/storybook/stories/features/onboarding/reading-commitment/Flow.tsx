import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FunnelStepShell } from '../signupFunnel.mocks';
import type { Platform } from './NotificationPreview';
import { LockScreen } from './NotificationPreview';
import { SourceConfetti } from './SourceConfetti';
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
import { ReminderPicker } from '@dailydotdev/shared/src/components/onboarding/FeedPatchy/ReminderPicker';

/**
 * A replacement for Feed Patchy: the user says how much they read today and
 * where they want to be, picks a reminder time, and sees the exact push
 * daily.dev will send before turning notifications on.
 *
 * Story-only. Every screen is built from the funnel's own pieces (glass CTA
 * bar, onboarding headline, the radio list the role and quiz steps use, the
 * production reminder picker).
 */

export type ScreenId = 'today' | 'goal' | 'time' | 'commit' | 'done';

export interface FlowProps {
  /** Which phone the notification preview is drawn as. */
  platform: Platform;
  /** Opens the flow on this screen, with sample answers filled in. */
  startAt?: ScreenId;
  /** With `startAt: 'done'`, the ending for a skipped reminder. */
  isSampleSkipped?: boolean;
  /** Holds the screen still: the end screen never moves on. */
  isStatic?: boolean;
  /** Sample answers, when `startAt` fills them in. */
  sampleGoal?: string;
  sampleTime?: string;
  /** The end screen replays itself instead of starting the flow over. */
  isLoopingEnding?: boolean;
  /**
   * Set when the flow runs as the funnel's reading-reminder step: the shell
   * comes from FunnelStepper, and the ending hands back to it.
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
  { value: '5', label: 'A quick catch-up' },
  { value: '10', label: 'One good read' },
  { value: '15', label: 'A steady habit' },
  { value: '30', label: 'Deep learning' },
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

const timePickerCss = `
.rc-time-picker .uppercase { display: none; }
.rc-time-picker .uppercase + * { margin-inline: auto; }
`;

/** How long the end screen holds before moving on, as Feed Patchy's did. */
const ENDING_HOLD_MS = 3000;

const STEP = { type: FunnelStepType.ReadingReminder, parameters: {} };
// Where the commitment sits in the signup funnel, so the dots read right.
const FIRST_STEP_INDEX = 2;

const SCREENS: ScreenId[] = ['today', 'goal', 'time', 'commit', 'done'];

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

const prefersReducedMotion = (): boolean =>
  !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Feed Patchy's ending: the progress bar, run from empty to full over the hold. */
const CountdownBar = (): ReactElement => {
  const [percentage, setPercentage] = useState(0);

  // One frame at empty first, so the width has something to transition from.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPercentage(100));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <span
      className="w-full max-w-48"
      style={{ '--fp-hold': `${ENDING_HOLD_MS}ms` } as CSSProperties}
    >
      <ProgressBar
        percentage={percentage}
        shouldShowBg
        className={{
          wrapper: 'h-1 rounded-max',
          bar: 'h-full rounded-max ease-linear [transition-duration:var(--fp-hold)]',
        }}
      />
    </span>
  );
};

/** The funnel step chrome: headline, subheadline, body, glass CTA. */
const StepScreen = ({
  headline,
  subheadline,
  cta,
  isCtaDisabled,
  onCta,
  skip,
  docked,
  isAdvancing,
  isLeaving,
  children,
}: {
  headline: ReactNode;
  subheadline?: ReactNode;
  cta: string;
  /** Hides the CTA and counts down to the next step in its place. */
  isAdvancing?: boolean;
  /** Plays the hand-off to the next screen: the CTA fades with it. */
  isLeaving?: boolean;
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
    // Also off while leaving, so a second tap can't run the hand-off again.
    disabled={isCtaDisabled || isLeaving}
    onClick={onCta}
    skip={skip}
    docked={docked}
    isCtaHidden={isAdvancing || isLeaving}
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
    {isAdvancing && (
      <div role="status" className="fixed inset-x-0 bottom-0 z-3 pb-safe-or-6">
        <div
          className={classNames(
            funnelStepRail,
            'flex flex-col items-center gap-2 pt-6',
          )}
        >
          <span className="text-text-tertiary typo-footnote">
            Taking you to your feed…
          </span>
          <CountdownBar />
        </div>
      </div>
    )}
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
      defaultValue={value ? [value] : []}
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

const RING_RADIUS = 68;
/** The hand-off from the reminder to the end screen, in ms. */
const LEAVE_MS = 650;

// The phone sinks into the middle of the screen as the text lifts away, and
// the goal ring grows out of the same spot: one motion across two screens.
const handOffCss = `
@keyframes rc-text-out {
  to { opacity: 0; transform: translateY(-0.75rem); filter: blur(0.25rem); }
}
@keyframes rc-phone-out {
  0% { transform: none; }
  25% { opacity: 1; transform: scale(1.03); }
  100% {
    opacity: 0;
    transform: translateY(2.5rem) scale(0.4);
    filter: blur(0.375rem);
  }
}
@keyframes rc-fade-out { to { opacity: 0; } }
@keyframes rc-text-in {
  from { opacity: 0; transform: translateY(0.75rem); filter: blur(0.25rem); }
}
@keyframes rc-ring-in {
  from { opacity: 0; transform: scale(0.45); filter: blur(0.375rem); }
}
.rc-leave h1, .rc-leave p {
  animation: rc-text-out 380ms cubic-bezier(0.5, 0, 0.75, 0) both;
}
.rc-leave p { animation-delay: 40ms; }
.rc-leave .rc-phone {
  animation: rc-phone-out ${LEAVE_MS}ms cubic-bezier(0.6, 0, 0.2, 1) both;
}
.rc-leave .rc-skip { animation: rc-fade-out 200ms ease-out both; }
.rc-enter h1, .rc-enter p {
  animation: rc-text-in 560ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.rc-enter p { animation-delay: 80ms; }
.rc-enter .rc-ring {
  animation: rc-ring-in 760ms cubic-bezier(0.34, 1.4, 0.64, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .rc-leave *, .rc-enter * { animation: none !important; }
}
`;

// The rail's 3rem of padding and the six 0.25rem gaps come off first.
const DAY_SIZE = 'min(2.5rem, calc((100vw - 4.5rem) / 7))';

/** The week strip lands once the ring has mostly drawn, all of it hollow. */
const WEEK_DELAY_MS = 600;
/** Then today's flame pops into the first day. */
const FLAME_DELAY_MS = WEEK_DELAY_MS + 700;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const infographicCss = `
@keyframes rc-pop {
  from { opacity: 0; transform: translateY(1.25rem) scale(0.9); }
  to { opacity: 1; transform: none; }
}
@keyframes rc-today {
  0% { opacity: 0; transform: scale(0) rotate(-30deg); }
  55% { opacity: 1; transform: scale(1.35) rotate(8deg); }
  100% { opacity: 1; transform: none; }
}
@keyframes rc-glow {
  0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--theme-accent-bacon-default) 45%, transparent); }
  50% { box-shadow: 0 0 0 0.5rem color-mix(in srgb, var(--theme-accent-bacon-default) 0%, transparent); }
}
.rc-pop { animation: rc-pop 560ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.rc-today {
  animation: rc-today 560ms cubic-bezier(0.34, 1.56, 0.64, 1) both,
    rc-glow 1.6s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .rc-pop, .rc-today { animation: none; }
}
`;

/**
 * The end screen's picture of the plan: the daily goal as a streak-pink ring
 * that draws itself while source logos burst out of it, over the week the
 * streak starts today.
 */
const PlanInfographic = ({
  goal,
  isStatic,
}: {
  goal: number;
  isStatic: boolean;
}): ReactElement => {
  const [isDrawn, setIsDrawn] = useState(isStatic);

  // One frame undrawn first, so the stroke has something to animate from.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsDrawn(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <style>{infographicCss}</style>
      <div className="rc-ring relative flex size-44 items-center justify-center">
        <svg
          viewBox="0 0 160 160"
          className="absolute inset-0 size-full -rotate-90"
          aria-hidden
        >
          <defs>
            {/* The reading streak's pink, deepening along the stroke. */}
            <linearGradient id="rc-ring" x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: 'var(--theme-accent-bacon-subtler)' }}
              />
              <stop
                offset="100%"
                style={{ stopColor: 'var(--theme-accent-bacon-bolder)' }}
              />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="12"
            style={{ stroke: 'var(--theme-accent-bacon-flat)' }}
          />
          <circle
            cx="80"
            cy="80"
            r={RING_RADIUS}
            fill="none"
            stroke="url(#rc-ring)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={isDrawn ? 0 : RING_LENGTH}
            style={{
              transition: isStatic
                ? 'none'
                : 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        <span className="flex flex-col items-center">
          <span
            className="font-bold leading-none text-text-primary"
            style={{ fontSize: '3rem' }}
          >
            {goal}
          </span>
          <span className="text-text-tertiary typo-footnote">min a day</span>
        </span>
        <SourceConfetti isFrozen={isStatic} />
      </div>
      <div
        className={classNames('w-full', !isStatic && 'rc-pop')}
        style={{ animationDelay: `${WEEK_DELAY_MS}ms` }}
      >
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }, (_, day) => {
            const isToday = day === 0;
            return (
              <div key={day} className="flex flex-col items-center gap-2">
                {/* Every day starts hollow; today's flame pops in on top. */}
                <span
                  className="relative flex items-center justify-center rounded-full border-2 border-dashed border-border-subtlest-secondary"
                  // 2.5rem, or a seventh of the rail on screens too narrow for it.
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                >
                  {isToday && (
                    <span
                      className={classNames(
                        'absolute -inset-0.5 flex items-center justify-center rounded-full bg-background-default',
                        !isStatic && 'rc-today',
                      )}
                      style={{ animationDelay: `${FLAME_DELAY_MS}ms` }}
                    >
                      <ReadingStreakIcon secondary size={IconSize.Medium} />
                    </span>
                  )}
                </span>
                <span
                  className={classNames(
                    'typo-footnote',
                    isToday
                      ? 'font-bold text-text-primary'
                      : 'text-text-tertiary',
                  )}
                >
                  Day {day + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
  isSampleSkipped = false,
  isStatic = false,
  sampleGoal = '15',
  sampleTime = DEFAULT_REMINDER_TIME.value,
  isLoopingEnding = false,
  onFinish,
}: FlowProps): ReactElement => {
  const isSampled = !!startAt;
  const [index, setIndex] = useState(isSampled ? SCREENS.indexOf(startAt) : 0);
  const [today, setToday] = useState<string | undefined>(
    isSampled ? '5' : undefined,
  );
  const [goal, setGoal] = useState<string | undefined>(
    isSampled ? sampleGoal : undefined,
  );
  const [time, setTime] = useState<string | undefined>(
    isSampled ? sampleTime : undefined,
  );
  const [isSkipped, setIsSkipped] = useState(isSampleSkipped);
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const screen = SCREENS[index];
  const next = () =>
    setIndex((current) => Math.min(current + 1, SCREENS.length - 1));
  const [isLeaving, setIsLeaving] = useState(false);
  const [hasHandedOff, setHasHandedOff] = useState(false);
  // The reminder screen takes one answer: once Turn on or Skip is tapped,
  // further taps on either do nothing.
  const hasAnswered = useRef(false);
  const answerOnce = (answer: () => void) => () => {
    if (hasAnswered.current) {
      return;
    }
    hasAnswered.current = true;
    answer();
  };
  // Turning reminders on plays the hand-off before the end screen mounts;
  // with reduced motion there is nothing to wait for.
  const handOff = answerOnce(() => {
    if (prefersReducedMotion()) {
      next();
      return;
    }
    setIsLeaving(true);
    window.setTimeout(() => {
      setIsLeaving(false);
      setHasHandedOff(true);
      next();
    }, LEAVE_MS);
  });
  const skipReminder = answerOnce(() => {
    setIsSkipped(true);
    next();
  });
  const restart = () => {
    setIndex(0);
    setToday(undefined);
    setGoal(undefined);
    setTime(undefined);
    setIsSkipped(false);
    setHasHandedOff(false);
    hasAnswered.current = false;
  };
  const [replay, setReplay] = useState(0);
  // The end screen moves on by itself; in the story that starts over, or
  // plays the ending again.
  useEffect(() => {
    if (screen !== 'done' || isStatic) {
      return undefined;
    }
    const timeout = window.setTimeout(
      onFinish ??
        (isLoopingEnding ? () => setReplay((current) => current + 1) : restart),
      ENDING_HOLD_MS + 600,
    );
    return () => window.clearTimeout(timeout);
  }, [screen, replay]);
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
            headline="How much do you read about tech on a typical day?"
            subheadline="Be honest, there’s no wrong answer."
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
            headline="And where would you like to be?"
            subheadline="Pick a goal you can keep on a busy day."
            cta="Continue"
            onCta={() => {
              setGoal(goal ?? goalStart);
              next();
            }}
          >
            <PostStack
              label="Your daily goal"
              options={GOAL_OPTIONS}
              value={goal ?? goalStart}
              onChange={setGoal}
            />
          </StepScreen>
        );
      case 'time':
        return (
          <StepScreen
            headline="When do you usually have a few minutes?"
            subheadline="We’ll save your daily read for then."
            cta="Continue"
            onCta={() => {
              setTime(time ?? timeOfHour(reminderHour));
              next();
            }}
          >
            <div className="rc-time-picker w-full">
              {/* Story-only: hides the production card’s "Daily reminder"
                  caption and centers its time zone link. */}
              <style>{timePickerCss}</style>
              <ReminderPicker
                hour={reminderHour}
                onChange={(hour) => setTime(timeOfHour(hour))}
                timezone={timezone}
                onTimezoneChange={setTimezone}
              />
            </div>
          </StepScreen>
        );
      case 'commit':
        return (
          <StepScreen
            headline="Turn on your daily reminder"
            subheadline={`One notification at ${reminderLabel} to help you read ${goalMinutes} minutes a day.`}
            cta="Turn on notifications"
            onCta={handOff}
            isLeaving={isLeaving}
            docked={
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Medium}
                onClick={skipReminder}
                disabled={isLeaving}
                className="rc-skip w-full"
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
      default:
        return (
          <StepScreen
            headline={
              isSkipped
                ? 'Your goal is set'
                : `See you ${
                    isFirstReminderToday(reminderTime) ? 'today' : 'tomorrow'
                  } at ${reminderLabel}`
            }
            subheadline={
              isSkipped
                ? 'You can turn on reminders anytime from your settings.'
                : 'Today still counts. Start reading now and day 1 is done.'
            }
            cta="Start reading"
            onCta={restart}
            isAdvancing
          >
            <PlanInfographic goal={goalMinutes} isStatic={isStatic} />
          </StepScreen>
        );
    }
  })();

  const screenView = (
    <>
      {/* Keyed so each screen mounts fresh, as funnel steps do. */}
      <style>{handOffCss}</style>
      <div
        key={`${screen}-${replay}`}
        className={classNames(
          'flex flex-1 flex-col',
          isLeaving && 'rc-leave',
          screen === 'done' && hasHandedOff && replay === 0 && 'rc-enter',
        )}
      >
        {content}
      </div>
    </>
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
