import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FeedBackdrop } from '../../milestone-rewards/shell';
import { Phase, WeeklyRewardsModal } from './WeeklyRewardsModal';
import { weekPlan } from './weekPlan';

// Review proposal for the zero-day week modal: the weekly reading rewards
// card. Two stories — the card on the feed with the controls beside it, and
// the same card filling the viewport, which is the one to resize: a bottom
// sheet on a phone, a fluid card on a tablet, the full card with its cast on
// desktop.

// The claim animation portals through `RootPortal`, which needs a QueryClient.
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

/**
 * The card's breakpoints, as viewport presets. Each one sits inside a range
 * the card actually changes at: under 420px everything stacks; to 655px the
 * phone sheet; to 1019px the fluid tablet card; from 1120px the cast appears.
 */
const VIEWPORTS = {
  zdPhoneS: {
    name: 'Small phone · 320 (stacked sheet)',
    styles: { width: '320px', height: '640px' },
    type: 'mobile',
  },
  zdPhone: {
    name: 'Phone · 375 (stacked sheet)',
    styles: { width: '375px', height: '812px' },
    type: 'mobile',
  },
  zdPhoneL: {
    name: 'Large phone · 430 (sheet, one header row)',
    styles: { width: '430px', height: '932px' },
    type: 'mobile',
  },
  zdTablet: {
    name: 'Tablet · 768 (fluid card)',
    styles: { width: '768px', height: '1024px' },
    type: 'tablet',
  },
  zdLaptop: {
    name: 'Laptop · 1024 (full card, no cast)',
    styles: { width: '1024px', height: '768px' },
    type: 'desktop',
  },
  zdDesktop: {
    name: 'Desktop · 1440 (full card + cast)',
    styles: { width: '1440px', height: '900px' },
    type: 'desktop',
  },
} as const;

type ViewportKey = keyof typeof VIEWPORTS;

const meta: Meta = {
  title: 'Features/ZeroDayStreak Review',
  parameters: { layout: 'fullscreen', viewport: { options: VIEWPORTS } },
};

export default meta;

type Story = StoryObj;

const phaseLabel: Record<Phase, string> = {
  [Phase.Unread]: 'Not read yet',
  [Phase.Ready]: 'Ready to claim',
  [Phase.Claimed]: 'Claimed today',
};

const Segmented = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}): ReactElement => (
  <div className="flex min-w-0 max-w-full items-center gap-2">
    <span className="shrink-0 text-text-quaternary typo-caption1">{label}</span>
    <div
      role="radiogroup"
      aria-label={label}
      className="flex max-w-full overflow-x-auto rounded-10 border border-border-subtlest-tertiary bg-surface-float p-0.5 [scrollbar-width:none]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          className={classNames(
            'shrink-0 rounded-8 px-2.5 py-1 font-bold typo-footnote',
            option.value === value
              ? 'bg-accent-bacon-default text-white'
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

/** Day, state and streak, driving the card — and a claim that works. */
interface WeekState {
  day: number;
  phase: Phase;
  streakDays: number;
}

const DEFAULT_WEEK: WeekState = {
  day: 4,
  phase: Phase.Ready,
  streakDays: 56,
};

const useWeek = (initial: WeekState = DEFAULT_WEEK) => {
  const [day, setDay] = useState(initial.day);
  const [phase, setPhase] = useState(initial.phase);
  const [streakDays, setStreakDays] = useState(initial.streakDays);
  const [isClaiming, setClaiming] = useState(false);
  // Bumped by the controls only, so the card re-reads its balances from the
  // new week while a claim made inside it keeps its own animation.
  const [version, setVersion] = useState(0);

  const onClaim = useCallback(() => {
    setClaiming(true);
    window.setTimeout(() => {
      setClaiming(false);
      setPhase(Phase.Claimed);
    }, 700);
  }, []);

  const controls: ReactNode = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-14 border border-border-subtlest-tertiary bg-background-default/90 px-3 py-2 backdrop-blur">
      <Segmented
        label="Day"
        value={day}
        onChange={(value) => {
          setDay(value);
          setVersion((current) => current + 1);
        }}
        options={weekPlan.map((planned) => ({
          value: planned.day,
          label: String(planned.day),
        }))}
      />
      <Segmented
        label="State"
        value={phase}
        onChange={(value) => {
          setPhase(value);
          setVersion((current) => current + 1);
        }}
        options={Object.values(Phase).map((value) => ({
          value,
          label: phaseLabel[value],
        }))}
      />
      <Segmented
        label="Streak"
        value={streakDays}
        onChange={setStreakDays}
        options={[4, 56, 365].map((value) => ({
          value,
          label: `${value} days`,
        }))}
      />
    </div>
  );

  const card = (
    <WeeklyRewardsModal
      key={version}
      day={day}
      phase={phase}
      streakDays={streakDays}
      isClaiming={isClaiming}
      onClaim={onClaim}
      onClose={() => undefined}
    />
  );

  return { controls, card, week: { day, phase, streakDays } };
};

const OnTheFeed = ({
  fullscreen,
  bare,
  initial,
}: {
  fullscreen?: boolean;
  /** No controls — for the frames of the Breakpoints story. */
  bare?: boolean;
  initial?: WeekState;
}): ReactElement => {
  const { controls, card } = useWeek(initial);

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={classNames(
          'relative flex flex-col overflow-hidden bg-background-default',
          fullscreen ? 'min-h-screen' : 'min-h-[48rem]',
        )}
      >
        <FeedBackdrop />
        <div className="absolute inset-0 bg-overlay-primary-pepper" />
        {!bare && <div className="relative z-3 p-3">{controls}</div>}
        <div className="relative flex flex-1 items-end justify-center tablet:items-center tablet:p-6 laptop:p-10">
          {card}
        </div>
      </div>
    </QueryClientProvider>
  );
};

export const WeeklyRewards: Story = {
  name: 'Weekly rewards',
  render: () => <OnTheFeed />,
};

export const WeeklyRewardsFullscreen: Story = {
  name: 'Weekly rewards · fullscreen (resize me)',
  render: () => <OnTheFeed fullscreen />,
};

/** The same fullscreen card, opened at one preset viewport. */
const atViewport = (key: ViewportKey, name: string): Story => ({
  name,
  render: () => <OnTheFeed fullscreen />,
  globals: { viewport: { value: key, isRotated: false } },
});

export const SmallPhone = atViewport('zdPhoneS', 'Small phone · 320');
export const Phone = atViewport('zdPhone', 'Phone · 375');
export const LargePhone = atViewport('zdPhoneL', 'Large phone · 430');
export const Tablet = atViewport('zdTablet', 'Tablet · 768');
export const Laptop = atViewport('zdLaptop', 'Laptop · 1024');
export const Desktop = atViewport('zdDesktop', 'Desktop · 1440');

/**
 * One frame of the Breakpoints story: the card with no controls, its week
 * read from args so every frame can be set from the URL.
 */
export const Frame: Story = {
  name: 'Frame (used by Breakpoints)',
  tags: ['!dev'],
  args: { ...DEFAULT_WEEK },
  render: (args) => <OnTheFeed fullscreen bare initial={args as WeekState} />,
};

const FRAMES: Array<{ key: ViewportKey; label: string; note: string }> = [
  {
    key: 'zdPhoneS',
    label: 'Small phone',
    note: 'Under 420px — stacked sheet',
  },
  { key: 'zdPhone', label: 'Phone', note: 'Under 420px — stacked sheet' },
  {
    key: 'zdPhoneL',
    label: 'Large phone',
    note: '420–655px — sheet, one header row',
  },
  { key: 'zdTablet', label: 'Tablet', note: '656–1019px — fluid card' },
  {
    key: 'zdLaptop',
    label: 'Laptop',
    note: '1020–1119px — full card, no cast',
  },
  {
    key: 'zdDesktop',
    label: 'Desktop',
    note: '1120px up — full card and cast',
  },
];

/** The Storybook theme, so the frames match the toolbar's light/dark. */
const useStorybookTheme = (): string => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const read = () =>
      setTheme(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      );
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
};

const BreakpointFrame = ({
  frame,
  week,
  theme,
  maxWidth,
}: {
  frame: (typeof FRAMES)[number];
  week: WeekState;
  theme: string;
  /** Wider viewports are scaled down to this width. */
  maxWidth: number;
}): ReactElement => {
  const { styles } = VIEWPORTS[frame.key];
  const width = parseInt(styles.width, 10);
  const height = parseInt(styles.height, 10);
  const scale = Math.min(1, maxWidth / width);
  const args = `day:${week.day};phase:${week.phase};streakDays:${week.streakDays}`;

  return (
    <figure className="flex shrink-0 flex-col gap-2">
      <figcaption className="flex flex-col">
        <span className="font-bold text-text-primary typo-footnote">
          {frame.label} · {width}×{height}
          {scale < 1 && (
            <span className="font-normal text-text-quaternary">
              {' '}
              (shown at {Math.round(scale * 100)}%)
            </span>
          )}
        </span>
        <span className="text-text-tertiary typo-caption1">{frame.note}</span>
      </figcaption>
      <div
        className="overflow-hidden rounded-16 border border-border-subtlest-tertiary"
        style={{ width: width * scale, height: height * scale }}
      >
        <iframe
          title={`${frame.label} ${width}px`}
          src={`/iframe.html?id=features-zerodaystreak-review--frame&viewMode=story&globals=theme:${theme}&args=${args}`}
          width={width}
          height={height}
          className="origin-top-left bg-background-default"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </figure>
  );
};

const BreakpointsOverview = (): ReactElement => {
  const { controls, week } = useWeek();
  const theme = useStorybookTheme();
  const phones = FRAMES.filter(({ key }) => VIEWPORTS[key].type === 'mobile');
  const wide = FRAMES.filter(({ key }) => VIEWPORTS[key].type !== 'mobile');

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-background-default p-6 text-text-primary">
      <header className="flex flex-col gap-3">
        <h1 className="typo-title2">Weekly rewards at every breakpoint</h1>
        <p className="max-w-[70ch] text-text-tertiary typo-callout">
          Each frame is the real card in a real viewport of that width, so the
          media queries fire as they would on the device. The controls set the
          day, state and streak in every frame; the claim works inside each one.
        </p>
        <div className="w-fit">{controls}</div>
      </header>
      <section className="flex flex-wrap items-start gap-6">
        {phones.map((frame) => (
          <BreakpointFrame
            key={frame.key}
            frame={frame}
            week={week}
            theme={theme}
            maxWidth={430}
          />
        ))}
      </section>
      <section className="flex flex-col gap-8">
        {wide.map((frame) => (
          <BreakpointFrame
            key={frame.key}
            frame={frame}
            week={week}
            theme={theme}
            maxWidth={1100}
          />
        ))}
      </section>
    </div>
  );
};

export const Breakpoints: Story = {
  name: '★ Breakpoints (all sizes)',
  render: () => <BreakpointsOverview />,
};
