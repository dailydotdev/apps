import React, { useState } from 'react';
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

// ---------------------------------------------------------------------------
// Earn-pop lab — a row of celebration animations at different speeds/easings so
// we can eyeball the perfect fit. These use INLINE keyframes (not the tailwind
// `animate-streak-earn-*` utilities) so they're independent of the tailwind
// build — i.e. they show the true speed even when the running Storybook is
// serving a stale tailwind config. Hit "Replay" to retrigger them all.
// ---------------------------------------------------------------------------
const POP_GRAY = 'var(--theme-border-subtlest-tertiary)';
const POP_PINK = 'var(--theme-accent-bacon-default)';
const POP_FILL =
  'color-mix(in srgb, var(--theme-accent-bacon-default) 28%, transparent)';
const RAIL_TINT =
  'color-mix(in srgb, var(--theme-surface-secondary) 3%, var(--theme-background-default))';

const POP_CSS = `
@keyframes lab-pop-rebound {
  0%   { transform: scale(1);    border-color: ${POP_GRAY}; }
  25%  { transform: scale(1.25); border-color: ${POP_PINK}; }
  55%  { transform: scale(0.97); border-color: ${POP_PINK}; }
  100% { transform: scale(1);    border-color: ${POP_PINK}; }
}
@keyframes lab-fill {
  0%   { background-color: transparent; }
  35%  { background-color: ${POP_FILL}; }
  100% { background-color: ${POP_FILL}; }
}
`;

interface PopVariation {
  id: string;
  label: string;
  frame: string;
  duration: string;
  easing: string;
}

// Same punch + rebound pop, swept across 6 durations from 0.15s to 1s, so we
// can compare speed only and pick the sweet spot.
const POP_VARIATIONS: PopVariation[] = [
  { duration: '0.15s', frame: 'lab-pop-rebound', easing: 'ease-out' },
  { duration: '0.3s', frame: 'lab-pop-rebound', easing: 'ease-out' },
  { duration: '0.45s', frame: 'lab-pop-rebound', easing: 'ease-out' },
  { duration: '0.6s', frame: 'lab-pop-rebound', easing: 'ease-out' },
  { duration: '0.8s', frame: 'lab-pop-rebound', easing: 'ease-out' },
  { duration: '1s', frame: 'lab-pop-rebound', easing: 'ease-out' },
].map((variation) => ({
  ...variation,
  id: `pop-${variation.duration.replace('.', '')}`,
  label: `${variation.duration} · punch + rebound`,
}));

const PopFlame = (): React.ReactElement => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
  </svg>
);

const EarnPopLab = (): React.ReactElement => {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-center gap-8">
      <style>{POP_CSS}</style>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRun((value) => value + 1)}
          className="focus-outline rounded-10 bg-accent-bacon-default px-4 py-1.5 font-bold text-white typo-callout"
        >
          ▶ Replay all
        </button>
        <span className="text-text-tertiary typo-caption1">
          Tell me which id feels right and I&apos;ll ship it.
        </span>
      </div>
      <div className="grid grid-cols-3 gap-x-10 gap-y-12">
        {POP_VARIATIONS.map((variation) => (
          <div
            key={`${variation.id}-${run}`}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative h-[62px] w-[54px]">
              <span
                className="absolute inset-0 rounded-[16px] border"
                style={{
                  animation: `${variation.frame} ${variation.duration} ${variation.easing} both`,
                }}
              />
              <span
                className="absolute inset-[3px] rounded-[13px]"
                style={{
                  animation: `lab-fill ${variation.duration} ${variation.easing} both`,
                }}
              />
              <span className="absolute left-[7px] top-[7px] flex size-10 items-center justify-center rounded-12 bg-surface-float font-bold text-text-tertiary typo-callout">
                AD
              </span>
              <span
                className="absolute -bottom-[8px] left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-8 px-1.5 py-0.5 font-bold text-accent-bacon-default typo-caption1 tabular-nums"
                style={{ backgroundColor: RAIL_TINT }}
              >
                <PopFlame />
                12
              </span>
            </div>
            <span className="text-center text-text-secondary typo-caption1">
              {variation.label}
            </span>
            <code className="text-text-quaternary typo-caption2">
              {variation.id}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};

// A side-by-side comparison of earn-pop speeds + easings. Independent inline
// keyframes (see POP_CSS) so the timing is accurate regardless of the tailwind
// build state. Use the Replay button to retrigger.
export const EarnPopVariations: Story = {
  argTypes: {
    state: { table: { disable: true } },
    count: { table: { disable: true } },
    hasReadToday: { table: { disable: true } },
    isLoading: { table: { disable: true } },
    chipTooltip: { table: { disable: true } },
    chipTooltipOpen: { table: { disable: true } },
  },
  render: () => <EarnPopLab />,
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
