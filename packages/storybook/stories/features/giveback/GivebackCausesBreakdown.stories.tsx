import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { GivebackCausesBreakdown } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesBreakdown';
import type { GivebackCauseAllocation } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesBreakdown';
import { mockCauses, withGiveback } from './giveback.mocks';

// Pair the shared mock causes with a plausible, uneven split of the community
// pool (whole dollars, biggest-first) so every variant has real proportions to
// draw.
const allocations: GivebackCauseAllocation[] = mockCauses().map(
  (cause, index) => ({
    cause,
    amount: [4200, 2600, 1800, 1100, 700, 400][index] ?? 300,
  }),
);

const fewAllocations: GivebackCauseAllocation[] = allocations.slice(0, 3);

// Constrain to the page column width so each variant reads the way it would
// slotted between the hero and the tabs.
const Frame = ({ children }: { children: ReactElement }): ReactElement => (
  <div className="mx-auto w-full max-w-3xl">{children}</div>
);

const meta: Meta<typeof GivebackCausesBreakdown> = {
  title: 'Features/Giveback/Causes breakdown',
  component: GivebackCausesBreakdown,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The causes breakdown block that sits below the hero and above the tabs, turning "the pool you are growing" into a picture. One component, four swappable visuals — a stacked split bar, a donut, playful storage tanks, and a proportional mosaic — all sharing the giveback food-palette accents and count-up motion.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackCausesBreakdown>;

// Variant 1 — the on-brand default: one pool, split into coloured segments on
// the same dark hairline track as the hero funding meter.
export const StackedSplit: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} variant="stacked" />
    </Frame>
  ),
};

// Variant 2 — a donut with the pool total counting up in the hole and a legend
// alongside.
export const Donut: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} variant="donut" />
    </Frame>
  ),
};

// Flat (boxless) donut — how it renders in the page flow, below the hero and
// above the tabs: no card chrome, open in the layout like the onboarded tabs.
export const FlatOnPage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `flat` layout used on the page: no border, surface fill or glow — just the header and viz sitting in the content flow.',
      },
    },
  },
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} variant="donut" flat />
    </Frame>
  ),
};

// Variant 3 — the "store storage" take: one tank per cause, filled to its share
// of the top backer's level with a travelling liquid shine.
export const StorageTanks: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} variant="silos" />
    </Frame>
  ),
};

// Variant 4 — a mosaic where each tile flex-grows by its share, so a cause's
// footprint is its weight in the pool.
export const Mosaic: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} variant="mosaic" />
    </Frame>
  ),
};

// All four stacked for a side-by-side read of the same data.
export const Gallery: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant rendered against the same allocation for comparison.',
      },
    },
  },
  render: () => (
    <Frame>
      <div className="flex flex-col gap-8">
        <GivebackCausesBreakdown allocations={allocations} variant="stacked" />
        <GivebackCausesBreakdown allocations={allocations} variant="donut" />
        <GivebackCausesBreakdown allocations={allocations} variant="silos" />
        <GivebackCausesBreakdown allocations={allocations} variant="mosaic" />
      </div>
    </Frame>
  ),
};

// A leaner three-cause pool, so the variants hold up before the community
// spreads across the full roster.
export const FewCauses: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-8">
        <GivebackCausesBreakdown
          allocations={fewAllocations}
          variant="stacked"
        />
        <GivebackCausesBreakdown allocations={fewAllocations} variant="silos" />
      </div>
    </Frame>
  ),
};

// A deliberately long cause name so the capped, truncating title is visible
// alongside the normal roster.
const longTitleAllocations: GivebackCauseAllocation[] = [
  {
    cause: {
      ...mockCauses()[0],
      title: 'Open-source maintainers, docs & tooling grants',
    },
    amount: 4200,
  },
  ...allocations.slice(1),
];

// Legend spacing review — the percentage and amount now hug each cause title
// instead of being pushed to the far right edge, so every entry is only as wide
// as its own content. Shown on the two Legend-driven variants (stacked + donut),
// with a long-title row to confirm the title caps and truncates cleanly.
export const LegendSpacing: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Tighter legend groups: the share and dollar amount sit right next to the cause name rather than spread across the full column. The last block shows a long title truncating at its cap.',
      },
    },
  },
  render: () => (
    <Frame>
      <div className="flex flex-col gap-8">
        <GivebackCausesBreakdown allocations={allocations} variant="stacked" />
        <GivebackCausesBreakdown allocations={allocations} variant="donut" />
        <GivebackCausesBreakdown
          allocations={longTitleAllocations}
          variant="stacked"
        />
      </div>
    </Frame>
  ),
};
