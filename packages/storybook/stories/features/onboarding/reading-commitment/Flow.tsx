import type { CSSProperties, ReactElement, ReactNode } from 'react';
import React, { useEffect, useState } from 'react';
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
import { BellIcon } from '@dailydotdev/shared/src/components/icons/Bell';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { TimerIcon } from '@dailydotdev/shared/src/components/icons/Timer';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { FunnelStepShell } from '../signupFunnel.mocks';
import type { Platform, PushContent } from './NotificationPreview';
import { LockScreen, Notification } from './NotificationPreview';
import { SourceConfetti } from './SourceConfetti';
import {
  DEFAULT_REMINDER_TIME,
  REMINDER_TIMES,
  reminderTimeOf,
} from './reminderTimes';

/**
 * A replacement for Feed Patchy: instead of feeding the puppy, the user says
 * how much they read today and where they want to be, commits to that goal,
 * and sees the exact push daily.dev will send before turning notifications on.
 *
 * Story-only. Every screen is built from the funnel's own pieces (glass CTA
 * bar, onboarding headline, the radio list the role and quiz steps use).
 */

export type Direction = 'questions' | 'oneScreen';
export type Gap = 'bars' | 'week' | 'phone';
export type Preview = 'lockScreen' | 'banners';
export type SkipPlacement = 'topBar' | 'inline';
export type CommitCopy = 'turnOn' | 'nudge' | 'thisIsIt' | 'keepGoal';
export type ScreenId =
  | 'today'
  | 'goal'
  | 'plan'
  | 'time'
  | 'commit'
  | 'notify'
  | 'done';

export interface FlowProps {
  direction: Direction;
  gap: Gap;
  preview: Preview;
  platform: Platform;
  askTime: boolean;
  skipPlacement: SkipPlacement;
  /** The phone commit screen's copy; each says notifications turn on here. */
  commitCopy: CommitCopy;
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
}

interface Option {
  value: string;
  label: string;
  hint?: string;
}

const TODAY_OPTIONS: Option[] = [
  { value: '0', label: 'Barely anything' },
  { value: '5', label: 'A post or two', hint: '~5 min' },
  { value: '15', label: 'About 15 minutes', hint: '~15 min' },
  { value: '30', label: '30 minutes or more', hint: '30+ min' },
];

const GOAL_OPTIONS: Option[] = [
  { value: '5', label: 'A quick catch-up', hint: '5 min' },
  { value: '10', label: 'One good read', hint: '10 min' },
  { value: '15', label: 'A steady habit', hint: '15 min' },
  { value: '30', label: 'Deep learning', hint: '30 min' },
];

const TIME_OPTIONS: Option[] = REMINDER_TIMES.map(({ value, label }) => ({
  value,
  label,
  hint: value,
}));

const DEFAULT_TIME = DEFAULT_REMINDER_TIME.value;

interface ScreenCopy {
  headline: string;
  subheadline: string;
  cta: string;
}

const PHONE_COPY: Record<
  CommitCopy,
  (goal: number, time: string) => ScreenCopy
> = {
  turnOn: (goal, time) => ({
    headline: 'Turn on your daily reminder',
    subheadline: `One notification at ${time} to help you read ${goal} minutes a day.`,
    cta: 'Turn on notifications',
  }),
  nudge: (goal, time) => ({
    headline: `Get a nudge at ${time}`,
    subheadline: `Allow notifications and daily.dev will remind you to read ${goal} minutes a day.`,
    cta: 'Allow notifications',
  }),
  thisIsIt: (_, time) => ({
    headline: 'This is your daily reminder',
    subheadline: `Enable notifications and you’ll get it every day at ${time}.`,
    cta: 'Enable notifications',
  }),
  keepGoal: (goal, time) => ({
    headline: `Hit ${goal} minutes a day`,
    subheadline: `Enable notifications for one reminder a day at ${time}. Nothing else.`,
    cta: 'Enable notifications',
  }),
};
/** How long the end screen holds before moving on, as Feed Patchy's did. */
const ENDING_HOLD_MS = 3000;

const STEP = { type: FunnelStepType.ReadingReminder, parameters: {} };
// Where the commitment sits in the signup funnel, so the dots read right.
const FIRST_STEP_INDEX = 2;

const screensFor = (
  direction: Direction,
  askTime: boolean,
  gap: Gap,
): ScreenId[] => {
  const isQuestions = direction === 'questions';
  // With the phone on the commit screen, committing turns reminders on too.
  const hasNotify = !isQuestions || gap !== 'phone';

  return [
    ...(isQuestions ? (['today', 'goal'] as ScreenId[]) : ['plan' as const]),
    ...(askTime ? ['time' as const] : []),
    ...(isQuestions ? ['commit' as const] : []),
    ...(hasNotify ? ['notify' as const] : []),
    'done' as const,
  ];
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

const clockOf = (time: string): string => time.replace(/\s?[AP]M$/, '');

const minutesLabel = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

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
  isAdvancing,
  children,
}: {
  headline: ReactNode;
  subheadline?: ReactNode;
  cta: string;
  /** Hides the CTA and counts down to the next step in its place. */
  isAdvancing?: boolean;
  isCtaDisabled?: boolean;
  onCta: () => void;
  skip?: { cta: string; onClick: () => void };
  children?: ReactNode;
}): ReactElement => (
  <FunnelStepCtaWrapper
    isGlass
    cta={{ label: cta }}
    disabled={isCtaDisabled}
    onClick={onCta}
    skip={skip}
    isCtaHidden={isAdvancing}
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
  options: Option[];
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

const Chips = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
}): ReactElement => (
  <div className="flex w-full flex-col gap-2">
    <span className="font-bold text-text-tertiary typo-footnote">{label}</span>
    <div className="grid grid-cols-4 gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size={ButtonSize.Medium}
          variant={
            value === option.value ? ButtonVariant.Primary : ButtonVariant.Float
          }
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.hint ?? `${option.value} min`}
        </Button>
      ))}
    </div>
  </div>
);

// The tallest bar's height, in rem; the other scales to it.
const BAR_REM = 7;

const Bar = ({
  label,
  minutes,
  max,
  isGoal,
}: {
  label: string;
  minutes: number;
  max: number;
  isGoal?: boolean;
}): ReactElement => (
  <div className="flex flex-1 flex-col items-center gap-2">
    <span
      className={classNames(
        'font-bold typo-title3',
        isGoal ? 'text-text-primary' : 'text-text-tertiary',
      )}
    >
      {minutes ? `${minutes} min` : 'None'}
    </span>
    <div
      className={classNames(
        'w-16 rounded-12 transition-[height] duration-500 ease-out',
        isGoal
          ? 'bg-gradient-to-t from-accent-bacon-default to-accent-cabbage-default'
          : 'bg-surface-disabled',
      )}
      style={{ height: `${Math.max(0.75, (minutes / max) * BAR_REM)}rem` }}
    />
    <span className="text-text-secondary typo-footnote">{label}</span>
  </div>
);

const GapBars = ({
  today,
  goal,
}: {
  today: number;
  goal: number;
}): ReactElement => {
  const max = Math.max(today, goal, 5);
  const diff = goal - today;

  return (
    <div className="flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 pb-4 pt-5">
      <div className="flex items-end justify-center gap-2">
        <Bar label="Today" minutes={today} max={max} />
        {/* Level with the shorter bar's top, between the two columns. */}
        <span className="mb-9 flex shrink-0 flex-col items-center gap-1">
          <span className="rounded-max bg-background-default px-2.5 py-1 font-bold text-text-primary typo-caption1">
            {diff > 0 ? `+${diff} min` : 'On track'}
          </span>
          <span aria-hidden className="text-text-quaternary typo-title3">
            →
          </span>
        </span>
        <Bar label="Your goal" minutes={goal} max={max} isGoal />
      </div>
      <span className="border-t border-border-subtlest-tertiary pt-3 text-center text-text-tertiary typo-footnote">
        That’s {minutesLabel(goal * 30)} of reading in your first month.
      </span>
    </div>
  );
};

const GapWeek = ({ goal }: { goal: number }): ReactElement => (
  <div className="flex w-full flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 7 }, (_, day) => {
        const date = addDays(day);
        return (
          <div key={day} className="flex flex-col items-center gap-1.5">
            <span
              className={classNames(
                'typo-caption1',
                day === 0
                  ? 'font-bold text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {day === 0 ? 'Today' : DAY_NAMES[date.getDay()]}
            </span>
            <span
              className={classNames(
                'flex size-9 items-center justify-center rounded-full font-bold typo-caption1',
                day === 0
                  ? 'bg-gradient-to-br from-accent-bacon-default to-accent-cabbage-default text-white'
                  : 'border-2 border-dashed border-border-subtlest-secondary text-text-tertiary',
              )}
            >
              {goal}m
            </span>
          </div>
        );
      })}
    </div>
    <span className="border-t border-border-subtlest-tertiary pt-3 text-center text-text-secondary typo-callout">
      <strong className="text-text-primary">{minutesLabel(goal * 7)}</strong>{' '}
      of reading by next {DAY_NAMES[addDays(7).getDay()]}
    </span>
  </div>
);

const RING_RADIUS = 68;
/** The tiles land one by one, starting once the ring has mostly drawn. */
const TILE_DELAY_MS = 450;
const TILE_STAGGER_MS = 550;
const tileDelay = (index: number): number =>
  TILE_DELAY_MS + index * TILE_STAGGER_MS;
const COUNT_MS = 900;

const infographicCss = `
@keyframes rc-pop {
  from { opacity: 0; transform: translateY(1.25rem) scale(0.9); }
  to { opacity: 1; transform: none; }
}
@keyframes rc-badge {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.2) rotate(8deg); }
  100% { transform: none; }
}
@keyframes rc-ring-bell {
  0%, 100% { transform: rotate(0); }
  15% { transform: rotate(18deg); }
  30% { transform: rotate(-16deg); }
  45% { transform: rotate(12deg); }
  60% { transform: rotate(-8deg); }
  75% { transform: rotate(4deg); }
}
@keyframes rc-dot {
  0% { opacity: 0; transform: scale(0); }
  70% { opacity: 1; transform: scale(1.6); }
  100% { opacity: 1; transform: none; }
}
.rc-pop { animation: rc-pop 560ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.rc-badge { animation: rc-badge 520ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
.rc-ring-bell {
  animation: rc-ring-bell 800ms ease-in-out both;
  transform-origin: 50% 10%;
}
.rc-dot { animation: rc-dot 360ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .rc-pop, .rc-badge, .rc-ring-bell, .rc-dot { animation: none; }
}
`;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * The end screen's picture of the plan: the daily goal as a ring that draws
 * itself while source logos burst out of it, over three quick facts.
 */
const PlanInfographic = ({
  goal,
  reminder,
  isStatic,
}: {
  goal: number;
  /** The reminder time, or nothing when it was skipped. */
  reminder?: string;
  isStatic: boolean;
}): ReactElement => {
  const [isDrawn, setIsDrawn] = useState(isStatic);

  // One frame undrawn first, so the stroke has something to animate from.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsDrawn(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // The month's reading counts up as the tiles land.
  const monthMinutes = goal * 30;
  const [counted, setCounted] = useState(isStatic ? monthMinutes : 0);
  useEffect(() => {
    if (isStatic) {
      return undefined;
    }
    let frame = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now + tileDelay(2) + 250;
      const progress = Math.min(1, Math.max(0, (now - start) / COUNT_MS));
      // Ease out, so it slows as it lands on the total.
      setCounted(Math.round(monthMinutes * (1 - (1 - progress) ** 3)));
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [isStatic, monthMinutes]);

  const tiles = [
    {
      label: 'Daily reminder',
      value: reminder ?? 'Off',
      icon: (
        <span
          className={classNames('flex', !isStatic && 'rc-ring-bell')}
          style={{ animationDelay: `${tileDelay(0) + 450}ms` }}
        >
          <BellIcon secondary size={IconSize.Small} />
        </span>
      ),
      tint: 'bg-accent-cabbage-flat',
      badge: 'bg-accent-cabbage-default',
    },
    {
      label: 'Streak starts',
      value: 'Day 1',
      icon: <ReadingStreakIcon secondary size={IconSize.Small} />,
      tint: 'bg-accent-bacon-flat',
      // The streak icon carries its own pink, so it sits on a plain badge.
      badge: 'bg-background-default',
      extra: (
        <span className="flex gap-1" aria-hidden>
          {Array.from({ length: 7 }, (_, day) => (
            <span
              key={day}
              className={classNames(
                'size-1.5 rounded-full',
                day === 0 ? 'bg-accent-bacon-default' : 'bg-surface-disabled',
                !isStatic && 'rc-dot',
              )}
              // The week fills in after the tile lands, today last and loudest.
              style={{
                animationDelay: `${
                  tileDelay(1) + (day === 0 ? 650 : 250 + day * 40)
                }ms`,
              }}
            />
          ))}
        </span>
      ),
    },
    {
      label: 'This month',
      value: minutesLabel(counted) || '0 min',
      icon: <TimerIcon secondary size={IconSize.Small} />,
      tint: 'bg-accent-cheese-flat',
      badge: 'bg-accent-cheese-default',
    },
  ];

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <style>{infographicCss}</style>
      <div className="relative flex size-40 items-center justify-center">
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
      <div className="grid w-full grid-cols-3 gap-2">
        {tiles.map(({ label, value, icon, tint, badge, extra }, index) => (
          <div
            key={label}
            className={classNames(
              'flex flex-col items-start gap-2 rounded-16 p-3 text-left',
              tint,
              !isStatic && 'rc-pop',
            )}
            style={{ animationDelay: `${tileDelay(index)}ms` }}
          >
            <span
              className={classNames(
                'flex size-8 items-center justify-center rounded-10 text-white',
                badge,
                !isStatic && 'rc-badge',
              )}
              style={{ animationDelay: `${tileDelay(index) + 180}ms` }}
            >
              {icon}
            </span>
            <span className="flex flex-col">
              <span className="font-bold tabular-nums text-text-primary typo-callout">
                {value}
              </span>
              <span className="text-text-tertiary typo-caption1">{label}</span>
            </span>
            {extra}
          </div>
        ))}
      </div>
    </div>
  );
};

const gapHeadline = (today: number, goal: number): string =>
  goal > today
    ? `Just ${goal - today} more minutes a day`
    : 'You’re already there';

const gapSubheadline = (today: number, goal: number): string =>
  goal > today
    ? 'Small daily reads add up. Commit to your goal and daily.dev will help you keep it.'
    : 'Now make it a habit. Commit to your goal and daily.dev will help you keep it.';

const pushesFor = (goal: number, time: string): PushContent[] => [
  { ...reminderTimeOf(time).push(goal), when: 'now' },
  {
    title: 'Day 2 of your reading streak 🔥',
    body: `Keep it going with ${goal} minutes of the best dev news.`,
    when: `${DAY_NAMES[addDays(2).getDay()]} ${time}`,
  },
  {
    title: 'Your top picks for today',
    body: 'A deep dive on TypeScript and two more posts you’ll like.',
    when: `${DAY_NAMES[addDays(3).getDay()]} ${time}`,
  },
];

const NotifyPreview = ({
  preview,
  platform,
  goal,
  time,
}: {
  preview: Preview;
  platform: Platform;
  goal: number;
  time: string;
}): ReactElement => {
  const pushes = pushesFor(goal, time);

  if (preview === 'lockScreen') {
    return (
      <LockScreen
        platform={platform}
        clock={clockOf(time)}
        date={longDate(addDays(1))}
        notifications={[pushes[0]]}
      />
    );
  }

  // The next three days of nudges, stacked as they'd arrive.
  return (
    <div className="flex w-full flex-col gap-3">
      {pushes.map((push, index) => (
        <div
          key={push.title}
          className="flex flex-col gap-1"
          style={{ opacity: 1 - index * 0.22 }}
        >
          <Notification
            platform={platform}
            {...push}
            when={index === 0 ? `Tomorrow ${time}` : push.when}
          />
        </div>
      ))}
    </div>
  );
};

export const Flow = ({
  direction,
  gap,
  preview,
  platform,
  askTime,
  skipPlacement,
  commitCopy,
  startAt,
  isSampleSkipped = false,
  isStatic = false,
  sampleGoal = '15',
  sampleTime = DEFAULT_REMINDER_TIME.value,
  isLoopingEnding = false,
}: FlowProps): ReactElement => {
  const screens = screensFor(direction, askTime, gap);
  const isSampled = !!startAt && screens.includes(startAt);
  const [index, setIndex] = useState(
    isSampled ? screens.indexOf(startAt) : 0,
  );
  const [today, setToday] = useState<string | undefined>(
    isSampled ? '5' : undefined,
  );
  const [goal, setGoal] = useState<string | undefined>(
    isSampled ? sampleGoal : undefined,
  );
  const [time, setTime] = useState<string | undefined>(
    isSampled && askTime ? sampleTime : undefined,
  );
  const [isSkipped, setIsSkipped] = useState(isSampleSkipped);

  const screen = screens[index];
  const next = () => setIndex((current) => current + 1);
  const restart = () => {
    setIndex(0);
    setToday(undefined);
    setGoal(undefined);
    setTime(undefined);
    setIsSkipped(false);
  };
  const [replay, setReplay] = useState(0);
  // The end screen moves on by itself; in the story that starts over, or
  // plays the ending again.
  useEffect(() => {
    if (screen !== 'done' || isStatic) {
      return undefined;
    }
    const timeout = window.setTimeout(
      isLoopingEnding ? () => setReplay((current) => current + 1) : restart,
      ENDING_HOLD_MS + 600,
    );
    return () => window.clearTimeout(timeout);
  }, [screen, replay]);
  const todayMinutes = Number(today ?? 0);
  const goalMinutes = Number(goal ?? 15);
  const reminderTime = time ?? DEFAULT_TIME;

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
            isCtaDisabled={!goal}
            onCta={next}
          >
            <RadioList
              name="goal"
              options={GOAL_OPTIONS}
              value={goal}
              onChange={setGoal}
            />
          </StepScreen>
        );
      case 'plan':
        return (
          <StepScreen
            headline={
              today && goal
                ? gapHeadline(todayMinutes, goalMinutes)
                : 'Let’s set your reading goal'
            }
            subheadline="Where you are today, and where you’d like to be."
            cta={goal ? `I commit to ${goal} min a day` : 'Pick your goal'}
            isCtaDisabled={!today || !goal}
            onCta={next}
          >
            <Chips
              label="On a typical day, I read"
              options={TODAY_OPTIONS.map((option) => ({
                ...option,
                hint: option.value === '0' ? 'None' : option.hint,
              }))}
              value={today}
              onChange={setToday}
            />
            <Chips
              label="I’d like to read"
              options={GOAL_OPTIONS}
              value={goal}
              onChange={setGoal}
            />
            {today && goal && (
              <GapBars today={todayMinutes} goal={goalMinutes} />
            )}
          </StepScreen>
        );
      case 'time':
        return (
          <StepScreen
            headline="When do you usually have a few minutes?"
            subheadline="We’ll save your daily read for then."
            cta="Continue"
            isCtaDisabled={!time}
            onCta={next}
          >
            <RadioList
              name="time"
              options={TIME_OPTIONS}
              value={time}
              onChange={setTime}
            />
          </StepScreen>
        );
      case 'commit': {
        const onSkip = () => {
          setIsSkipped(true);
          next();
        };
        if (gap === 'phone') {
          const phoneCopy = PHONE_COPY[commitCopy](goalMinutes, reminderTime);
          return (
            <StepScreen
              headline={phoneCopy.headline}
              subheadline={phoneCopy.subheadline}
              cta={phoneCopy.cta}
              onCta={next}
              skip={
                skipPlacement === 'topBar'
                  ? { cta: 'Skip for now', onClick: onSkip }
                  : undefined
              }
            >
              <NotifyPreview
                preview="lockScreen"
                platform={platform}
                goal={goalMinutes}
                time={reminderTime}
              />
              {skipPlacement === 'inline' && (
                <Button
                  type="button"
                  variant={ButtonVariant.Tertiary}
                  size={ButtonSize.Medium}
                  onClick={onSkip}
                  className="mt-auto"
                >
                  Skip for now
                </Button>
              )}
            </StepScreen>
          );
        }
        return (
          <StepScreen
            headline={gapHeadline(todayMinutes, goalMinutes)}
            subheadline={gapSubheadline(todayMinutes, goalMinutes)}
            cta={`I commit to ${goalMinutes} min a day`}
            onCta={next}
          >
            {gap === 'bars' ? (
              <GapBars today={todayMinutes} goal={goalMinutes} />
            ) : (
              <GapWeek goal={goalMinutes} />
            )}
          </StepScreen>
        );
      }
      case 'notify': {
        const notifyCopy = PHONE_COPY.turnOn(goalMinutes, reminderTime);
        const onSkip = () => {
          setIsSkipped(true);
          next();
        };
        return (
          <StepScreen
            headline={notifyCopy.headline}
            subheadline={notifyCopy.subheadline}
            cta={notifyCopy.cta}
            onCta={next}
            skip={
              skipPlacement === 'topBar'
                ? { cta: 'Skip for now', onClick: onSkip }
                : undefined
            }
          >
            <NotifyPreview
              preview={preview}
              platform={platform}
              goal={goalMinutes}
              time={reminderTime}
            />
            {skipPlacement === 'inline' && (
              <Button
                type="button"
                variant={ButtonVariant.Tertiary}
                size={ButtonSize.Medium}
                onClick={onSkip}
                className="mt-auto"
              >
                Skip for now
              </Button>
            )}
          </StepScreen>
        );
      }
      default:
        return (
          <StepScreen
            headline={
              isSkipped
                ? 'Your goal is set'
                : `See you tomorrow at ${reminderTime}`
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
            <PlanInfographic
              goal={goalMinutes}
              reminder={isSkipped ? undefined : reminderTime}
              isStatic={isStatic}
            />
          </StepScreen>
        );
    }
  })();

  return (
    <FunnelStepShell step={STEP} stepIndex={FIRST_STEP_INDEX + index} fullWidth>
      {/* Keyed so each screen mounts fresh, as funnel steps do. */}
      <div key={`${screen}-${replay}`} className="flex flex-1 flex-col">
        {content}
      </div>
    </FunnelStepShell>
  );
};
