import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { StreakRing } from '@dailydotdev/shared/src/components/sidebar/StreakRing';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

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
  none: 'New',
  pending: 'Pending — not read',
  safe: 'Read today',
  celebration: 'Earned (pop)',
  at_risk: 'At risk (≤6h)',
  critical: 'Critical (≤2h)',
  freeze: 'Rest day (frozen)',
};

// Placeholder avatar — the real rail passes the interactive profile button; here
// a static square stands in so the story stays provider-free.
const Avatar = (): React.ReactElement => (
  <span className="flex size-full items-center justify-center rounded-12 bg-surface-float font-bold text-text-tertiary typo-callout">
    AD
  </span>
);

const meta: Meta<typeof StreakRing> = {
  title: 'Components/Sidebar/StreakRing',
  component: StreakRing,
  args: {
    state: 'safe',
    count: 73,
    hasReadToday: true,
    avatar: <Avatar />,
  },
  argTypes: {
    state: { control: 'select', options: STATES },
    count: { control: { type: 'number', min: 0 } },
    hasReadToday: { control: 'boolean' },
    avatar: { table: { disable: true } },
    chipRef: { table: { disable: true } },
    onChipClick: { table: { disable: true } },
    chipTooltip: { control: 'text' },
    chipTooltipOpen: { control: 'boolean' },
    chipAriaLabel: { table: { disable: true } },
    chipAriaExpanded: { table: { disable: true } },
  },
  // The streak ring lives in the dark rail — render every story on the sidebar
  // background so it reads the way it does in the app.
  decorators: [
    (Story) => (
      <div className="dark flex min-h-[220px] items-center justify-center bg-background-default p-10">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StreakRing>;

// Tweak state / count / hasReadToday from the controls panel.
export const Playground: Story = {};

// Every state side by side — change the count control to see how each handles a
// long number (the flame + count break a wider gap in the bottom border).
export const AllStates: Story = {
  argTypes: {
    state: { table: { disable: true } },
    hasReadToday: { table: { disable: true } },
  },
  render: ({ count }) => (
    <div className="grid grid-cols-4 gap-x-8 gap-y-12">
      {STATES.map((state) => (
        <div key={state} className="flex flex-col items-center gap-4">
          <StreakRing
            state={state}
            count={state === 'none' ? 0 : (count ?? 73)}
            hasReadToday={state === 'safe' || state === 'celebration'}
            avatar={<Avatar />}
          />
          <span className="text-center text-text-secondary typo-caption1">
            {STATE_LABEL[state]}
          </span>
        </div>
      ))}
    </div>
  ),
};
