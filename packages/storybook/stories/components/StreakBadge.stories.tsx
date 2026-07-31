import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreakBadge } from '@dailydotdev/shared/src/components/sidebar/StreakBadge';
import { railTabLabelClass } from '@dailydotdev/shared/src/components/sidebar/common';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

// The v2 rail's reading-streak indicator (replaces the old avatar StreakRing).
// A small circular badge: state-driven ring + fill, with the flame filled once
// you've read today. Presentational — driven entirely by `state` + `hasReadToday`.
//
// HOVER: every badge below sits in a wrapper carrying `group/streaktab` — the
// same hook the real rail tab provides — so you can hover any of them to see
// the live hover state (unread ring AND flame go white together).

const STATES: StreakRingState[] = [
  'none',
  'pending',
  'safe',
  'celebration',
  'at_risk',
  'critical',
  'freeze',
];

const STATE_LABEL: Record<StreakRingState, string> = {
  none: 'New (no streak)',
  pending: 'Pending — not read yet',
  safe: 'Read today',
  celebration: 'Just earned (pop)',
  at_risk: 'At risk (≤6h left)',
  critical: 'Critical (≤2h left)',
  freeze: 'Rest day (frozen)',
};

// Which states represent "already read today" (flame filled) in real usage.
const READ_STATES = new Set<StreakRingState>(['safe', 'celebration', 'freeze']);

// One rail tab as the sidebar renders it: badge + day-count label, inside the
// `group/streaktab` wrapper the badge's hover styles hook into. Hovering it here
// behaves exactly like hovering the tab in the app.
const RailTabPreview = ({
  state,
  selected = false,
}: {
  state: StreakRingState;
  selected?: boolean;
}) => (
  <span className="group/streaktab flex w-16 cursor-pointer flex-col items-center gap-1 rounded-12 px-1 py-2 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary">
    <StreakBadge
      state={state}
      hasReadToday={READ_STATES.has(state)}
      selected={selected}
    />
    <span className={railTabLabelClass}>
      {state === 'none' ? 'Streak' : '73'}
    </span>
  </span>
);

const meta: Meta<typeof StreakBadge> = {
  title: 'Components/Sidebar/StreakBadge',
  component: StreakBadge,
  args: {
    state: 'safe',
    hasReadToday: true,
    selected: false,
  },
  argTypes: {
    state: { control: 'select', options: STATES },
    hasReadToday: { control: 'boolean' },
    // When this is the selected rail tab, the calm-state border turns pink.
    selected: { control: 'boolean' },
    className: { table: { disable: true } },
  },
  // Render on the dark rail background so the badge reads the way it does in the
  // app's left rail.
  decorators: [
    (Story) => (
      <div className="dark flex min-h-[220px] items-center justify-center bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-10">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StreakBadge>;

// Toggle state / hasReadToday from the controls panel.
export const Playground: Story = {};

// Every state side by side, each shown the way it sits in a rail tab (badge +
// day-count label below). This is the full state matrix for design review.
export const AllStates: Story = {
  argTypes: {
    state: { table: { disable: true } },
    hasReadToday: { table: { disable: true } },
  },
  render: () => (
    <div className="grid grid-cols-4 gap-x-8 gap-y-10">
      {STATES.map((state) => (
        <div key={state} className="flex flex-col items-center gap-3">
          <RailTabPreview state={state} />
          <span className="text-center text-text-secondary typo-caption1">
            {STATE_LABEL[state]}
          </span>
        </div>
      ))}
    </div>
  ),
};

// The same matrix with `selected` on — the calm-state rings turn pink (the
// reading-streak brand colour).
export const Selected: Story = {
  argTypes: {
    state: { table: { disable: true } },
    hasReadToday: { table: { disable: true } },
    selected: { table: { disable: true } },
  },
  render: () => (
    <div className="grid grid-cols-4 gap-x-8 gap-y-10">
      {STATES.map((state) => (
        <div key={state} className="flex flex-col items-center gap-3">
          <RailTabPreview state={state} selected />
          <span className="text-center text-text-secondary typo-caption1">
            {STATE_LABEL[state]}
          </span>
        </div>
      ))}
    </div>
  ),
};

// The same states zoomed in so the border/fill/flame details are easy to
// inspect and tweak.
export const Zoomed: Story = {
  argTypes: {
    state: { table: { disable: true } },
    hasReadToday: { table: { disable: true } },
  },
  render: () => (
    <div className="grid grid-cols-4 gap-10">
      {STATES.map((state) => (
        <div key={state} className="flex flex-col items-center gap-3">
          <span className="scale-[2.5]">
            <StreakBadge state={state} hasReadToday={READ_STATES.has(state)} />
          </span>
          <span className="mt-2 text-center text-text-secondary typo-caption1">
            {STATE_LABEL[state]}
          </span>
        </div>
      ))}
    </div>
  ),
};
