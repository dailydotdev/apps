import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { GivebackCausesBreakdown } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesBreakdown';
import type { GivebackCauseAllocation } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesBreakdown';
import { mockCauses, withGiveback } from './giveback.mocks';

// Pair the shared mock causes with a plausible, uneven split of the community
// pool (whole dollars, biggest-first) so the donut has real proportions to draw.
const allocations: GivebackCauseAllocation[] = mockCauses().map(
  (cause, index) => ({
    cause,
    amount: [4200, 2600, 1800, 1100, 700, 400][index] ?? 300,
  }),
);

const fewAllocations: GivebackCauseAllocation[] = allocations.slice(0, 3);

// A deliberately long cause name so the capped, truncating legend title stays
// visible alongside the normal roster.
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

// Constrain to the page column width so the donut reads the way it would
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
          'The causes breakdown block that sits below the hero and above the tabs, turning "the pool you are growing" into a picture: an SVG donut with the pool total counting up in the hole and a legend of causes with their share and amount, all sharing the giveback food-palette accents.',
      },
    },
  },
  decorators: [withGiveback()],
};

export default meta;

type Story = StoryObj<typeof GivebackCausesBreakdown>;

// The framed card, as used standalone.
export const Default: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} />
    </Frame>
  ),
};

// The `flat` layout used on the page: no border, surface fill or glow — just the
// header and donut sitting in the content flow, below the hero and above the
// tabs.
export const FlatOnPage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `flat` layout used on the page: no card chrome, open in the layout like the onboarded tabs.',
      },
    },
  },
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={allocations} flat />
    </Frame>
  ),
};

// A leaner three-cause pool, so the donut holds up before the community spreads
// across the full roster.
export const FewCauses: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={fewAllocations} />
    </Frame>
  ),
};

// A long cause name to confirm the legend title caps and truncates cleanly while
// the share and amount stay right-aligned.
export const LongTitle: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown allocations={longTitleAllocations} />
    </Frame>
  ),
};
