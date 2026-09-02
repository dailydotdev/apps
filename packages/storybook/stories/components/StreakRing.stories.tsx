import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StreakRing } from '@dailydotdev/shared/src/components/sidebar/StreakRing';
import type { StreakRingState } from '@dailydotdev/shared/src/hooks/streaks/useStreakRingState';

// The chip tooltip uses the shared Tooltip, which reads the request protocol via
// useQueryClient — so a QueryClientProvider is required or the tooltip throws.
const queryClient = new QueryClient();

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
    isLoading: { control: 'boolean' },
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
      <QueryClientProvider client={queryClient}>
        <div className="dark flex min-h-[220px] items-center justify-center bg-[color-mix(in_srgb,var(--theme-surface-secondary)_3%,var(--theme-background-default))] p-10">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof StreakRing>;

// Tweak state / count / hasReadToday from the controls panel.
export const Playground: Story = {};

// Same size as every other state — a neutral border with placeholder flame +
// number while the streak data is fetched, so the rail never shifts on load.
export const Loading: Story = {
  args: { isLoading: true },
};

// Critical state with the urgency tooltip forced open (in the rail it
// auto-opens for ~5s, or until the user hovers, then reverts to hover-only).
// The tooltip appears to the right of the streak.
export const CriticalWithTooltip: Story = {
  args: {
    state: 'critical',
    count: 12,
    hasReadToday: false,
    chipTooltip: 'Last chance - read 1 post to save your 12-day streak.',
    chipTooltipOpen: true,
  },
};

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
