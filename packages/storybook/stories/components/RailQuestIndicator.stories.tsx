import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ProgressCircle from '@dailydotdev/shared/src/components/ProgressCircle';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import {
  railTabClass,
  railTabLabelClass,
  RAIL_ICON_SIZE,
} from '@dailydotdev/shared/src/components/sidebar/common';
import { Bubble } from '@dailydotdev/shared/src/components/tooltips/utils';
import { JoystickIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

// PLAYGROUND — how should the rail tell you a quest is ready?
//
// Today the gamification tab is the reading-streak badge (flame + day count) and
// a claimable quest only adds a small count Bubble in the corner. The question
// is whether that is enough, or whether the tab should become a quest indicator
// while something is claimable — the ring-with-a-number we used to have.
//
// Each option below is drawn as a real rail tab (railTabClass + the shared label
// class) so proportions match the app. Compare them at the same claimable
// counts, and note the trade-off called out per option.
//
// Nothing here is wired into the rail yet — this is for choosing a direction.

const STREAK_DAYS = 73;

const Tab = ({
  label,
  children,
  selected = false,
}: {
  label: string;
  children: React.ReactNode;
  selected?: boolean;
}) => (
  <span
    className={`${railTabClass} ${selected ? '!text-text-primary' : ''} group/streaktab w-[68px]`}
  >
    <span className="relative flex items-center justify-center">{children}</span>
    <span className={railTabLabelClass}>{label}</span>
  </span>
);

const Option = ({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <span className="font-bold text-text-primary typo-callout">{title}</span>
      <span className="text-text-tertiary typo-caption1">{note}</span>
    </div>
    <div className="flex flex-wrap items-start gap-2 rounded-12 bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-3">
      {children}
    </div>
  </div>
);

// ── Option A: today's behaviour ─────────────────────────────────────────────
const StreakWithBubble = ({ claimable }: { claimable: number }) => (
  <Tab label={`${STREAK_DAYS}`}>
    <StreakBadge state="safe" hasReadToday />
    {claimable > 0 && <Bubble className="-right-2 -top-2 px-1">{claimable}</Bubble>}
  </Tab>
);

// ── Option B: the old quest ring, replacing the flame while claimable ───────
const QuestRing = ({
  progress,
  count,
}: {
  progress: number;
  count: number;
}) => (
  <Tab label="Quests">
    <span className="relative flex size-[1.625rem] items-center justify-center">
      <ProgressCircle progress={progress} size={26} stroke={2.5} />
      {/* The arc carries progress; the number is the claimable count, so it
          stays one digit and can't overflow the 26px ring. */}
      <span className="absolute font-bold text-text-primary typo-caption2 tabular-nums">
        {count}
      </span>
    </span>
  </Tab>
);

// ── Option C: streak keeps the tab, quest progress rides the outside ────────
const StreakWithProgressRing = ({ progress }: { progress: number }) => (
  <Tab label={`${STREAK_DAYS}`}>
    <span className="relative flex size-8 items-center justify-center">
      <ProgressCircle progress={progress} size={32} stroke={2} />
      <span className="absolute inset-0 flex items-center justify-center">
        <StreakBadge state="safe" hasReadToday />
      </span>
    </span>
  </Tab>
);

// ── Option D: swap the glyph for a "ready" mark while claimable ─────────────
const ReadyToClaim = ({ claimable }: { claimable: number }) => (
  <Tab label="Claim">
    <span className="relative flex size-[1.625rem] items-center justify-center rounded-full bg-accent-cabbage-default text-white">
      <VIcon secondary size={RAIL_ICON_SIZE} className="scale-75" />
      {claimable > 1 && (
        <Bubble className="-right-2 -top-2 px-1">{claimable}</Bubble>
      )}
    </span>
  </Tab>
);

// ── Option E: quests as their own glyph (no streak) ─────────────────────────
const JoystickWithBubble = ({ claimable }: { claimable: number }) => (
  <Tab label="Quests">
    <JoystickIcon size={RAIL_ICON_SIZE} aria-hidden />
    {claimable > 0 && (
      <Bubble className="-right-2 -top-2 px-1">{claimable}</Bubble>
    )}
  </Tab>
);

const COUNTS = [0, 1, 3, 9];

const meta: Meta = {
  title: 'Components/Sidebar/Rail quest indicator',
  decorators: [
    (Story) => (
      <div className="min-h-[400px] bg-background-default p-8">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

// All five candidates at a glance, each across 0/1/3/9 claimable quests.
export const Options: Story = {
  render: () => (
    <div className="grid gap-8 laptop:grid-cols-2">
      <Option
        title="A — Today: streak + count bubble"
        note="Cheapest, but the badge is easy to miss and the flame still owns the tab."
      >
        {COUNTS.map((c) => (
          <StreakWithBubble key={c} claimable={c} />
        ))}
      </Option>

      <Option
        title="B — Quest ring replaces the flame"
        note="Loudest. Costs the streak its rail presence — the day count disappears while any quest is claimable."
      >
        {[
          { progress: 0, count: 0 },
          { progress: 33, count: 1 },
          { progress: 66, count: 3 },
          { progress: 100, count: 9 },
        ].map(({ progress, count }) => (
          <QuestRing key={progress} progress={progress} count={count} />
        ))}
      </Option>

      <Option
        title="C — Streak inside a quest progress ring"
        note="Keeps both, but the tab grows to 32px and stops matching the other glyphs' box."
      >
        {[0, 33, 66, 100].map((p) => (
          <StreakWithProgressRing key={p} progress={p} />
        ))}
      </Option>

      <Option
        title="D — 'Ready to claim' mark while claimable"
        note="Clear call to action and stays 26px, but again hides the streak while it shows."
      >
        {[1, 2, 3, 9].map((c) => (
          <ReadyToClaim key={c} claimable={c} />
        ))}
      </Option>

      <Option
        title="E — Quests as a separate glyph"
        note="What the rail shows when reading streaks are off. Needs its own tab, so it competes for rail height."
      >
        {COUNTS.map((c) => (
          <JoystickWithBubble key={c} claimable={c} />
        ))}
      </Option>
    </div>
  ),
};

// Option A against every streak state, since whichever option wins has to work
// on top of all of them — including the danger states, where a purple bubble
// lands next to an amber or red ring.
export const BubbleOverStreakStates: Story = {
  render: () => {
    const states: { state: StreakRingState; label: string; read: boolean }[] = [
      { state: 'none', label: 'New', read: false },
      { state: 'pending', label: 'Pending', read: false },
      { state: 'safe', label: 'Read', read: true },
      { state: 'at_risk', label: 'At risk', read: false },
      { state: 'critical', label: 'Critical', read: false },
      { state: 'freeze', label: 'Rest', read: true },
    ];

    return (
      <div className="flex flex-wrap gap-6">
        {states.map(({ state, label, read }) => (
          <div key={state} className="flex flex-col items-center gap-2">
            <Tab label={state === 'none' ? 'Streak' : `${STREAK_DAYS}`}>
              <StreakBadge state={state} hasReadToday={read} />
              <Bubble className="-right-2 -top-2 px-1">3</Bubble>
            </Tab>
            <span className="text-text-tertiary typo-caption2">{label}</span>
          </div>
        ))}
      </div>
    );
  },
};

// The selected-tab treatment, since the rail's sliding pill sits behind whichever
// option wins.
export const Selected: Story = {
  render: () => (
    <div className="grid gap-8 laptop:grid-cols-3">
      <Option title="A — selected" note="streak + bubble, tab selected">
        <span className="rounded-12 bg-background-default">
          <Tab label={`${STREAK_DAYS}`} selected>
            <StreakBadge state="safe" hasReadToday selected />
            <Bubble className="-right-2 -top-2 px-1">3</Bubble>
          </Tab>
        </span>
      </Option>
      <Option title="B — selected" note="quest ring, tab selected">
        <span className="rounded-12 bg-background-default">
          <QuestRing progress={66} count={3} />
        </span>
      </Option>
      <Option title="D — selected" note="ready mark, tab selected">
        <span className="rounded-12 bg-background-default">
          <ReadyToClaim claimable={3} />
        </span>
      </Option>
    </div>
  ),
};
