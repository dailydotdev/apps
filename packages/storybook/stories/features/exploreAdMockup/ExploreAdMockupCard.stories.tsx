import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ExploreAdMockupCard } from '@dailydotdev/shared/src/features/exploreAdMockup/ExploreAdMockupCard';
import { getCreatives } from '@dailydotdev/shared/src/features/exploreAdMockup/creative';
import ExtensionProviders from '../../extension/_providers';

// The advertiser head card that replaces every ad slot on the Explore feed for
// the campaign mockup. Structure mirrors the live AdGrid / AdList, with the
// advertiser logo, per-creative tags, a "Promoted by {advertiser}" attribution,
// and a brand-colored CTA. Brand + copy come from the active campaigns
// (registry.ts); the creative is randomized per mount.
const meta: Meta<typeof ExploreAdMockupCard> = {
  title: 'Features/ExploreAdMockup/Card',
  component: ExploreAdMockupCard,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ExploreAdMockupCard>;

const creatives = getCreatives();

// Every creative across all active campaigns, grid card.
export const AllCreativesGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 laptop:grid-cols-3">
      {creatives.map((creative) => (
        <div key={creative.placement.id} className="w-80">
          <ExploreAdMockupCard creative={creative} />
        </div>
      ))}
    </div>
  ),
};

// The randomizer: each card picks a different creative, spread by feed index.
export const RandomizedGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 laptop:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={`rand-${i}`} className="w-80">
          <ExploreAdMockupCard feedIndex={i} />
        </div>
      ))}
    </div>
  ),
};

// List-layout variant (list feed / mobile).
export const AllCreativesList: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-4">
      {creatives.map((creative) => (
        <ExploreAdMockupCard
          key={creative.placement.id}
          isList
          creative={creative}
        />
      ))}
    </div>
  ),
};
