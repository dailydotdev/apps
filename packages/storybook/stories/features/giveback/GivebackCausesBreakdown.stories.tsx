import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { GivebackCausesBreakdown } from '@dailydotdev/shared/src/features/giveback/components/GivebackCausesBreakdown';
import type { ContributionCauseCategoryBreakdown } from '@dailydotdev/shared/src/features/giveback/types';
import { withGiveback } from './giveback.mocks';

// A plausible, uneven split of the community pool by cause category (whole
// dollars, biggest-first), matching the shape the `contributionCauseBreakdown`
// query returns, so the donut has real proportions to draw.
const breakdown: ContributionCauseCategoryBreakdown[] = [
  { category: 'Open source', points: 4200 },
  { category: 'Education', points: 2600 },
  { category: 'Accessibility', points: 1800 },
  { category: 'Climate', points: 1100 },
  { category: 'Mentorship', points: 700 },
  { category: 'Better docs', points: 400 },
];

const fewCategories: ContributionCauseCategoryBreakdown[] = breakdown.slice(0, 3);

// A deliberately long category name so the capped, truncating legend label stays
// visible alongside the normal roster.
const longLabelBreakdown: ContributionCauseCategoryBreakdown[] = [
  { category: 'Open-source maintainers, docs & tooling grants', points: 4200 },
  ...breakdown.slice(1),
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
          'The causes breakdown block that sits below the hero and above the tabs, turning "the pool you are growing" into a picture: an SVG donut with the pool total counting up in the hole and a legend of cause categories with their share and amount, all sharing the giveback food-palette accents. The backend groups the pool by category (via `contributionCauseBreakdown`) so the donut stays a handful of slices instead of one sliver per nonprofit.',
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
      <GivebackCausesBreakdown breakdown={breakdown} />
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
      <GivebackCausesBreakdown breakdown={breakdown} flat />
    </Frame>
  ),
};

// A leaner three-category pool, so the donut holds up before the community
// spreads across the full roster.
export const FewCategories: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown breakdown={fewCategories} />
    </Frame>
  ),
};

// A long category name to confirm the legend label caps and truncates cleanly
// while the share and amount stay right-aligned.
export const LongLabel: Story = {
  render: () => (
    <Frame>
      <GivebackCausesBreakdown breakdown={longLabelBreakdown} />
    </Frame>
  ),
};
