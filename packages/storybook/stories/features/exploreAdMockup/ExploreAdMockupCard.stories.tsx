import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { ExploreAdMockupCard } from '@dailydotdev/shared/src/features/exploreAdMockup/ExploreAdMockupCard';
import { getCreatives } from '@dailydotdev/shared/src/features/exploreAdMockup/creative';
import ExtensionProviders from '../../extension/_providers';

// The advertiser head card that replaces every ad slot on the Explore feed for
// the campaign mockup. Structure mirrors the live AdGrid / AdList, with the
// advertiser logo, per-creative tags, a "Promoted by {advertiser}" attribution,
// and the standard "Advertise here / Remove" footer. Brand + copy come from the
// active campaigns (registry.ts); the creative is randomized per mount.
const meta: Meta<typeof ExploreAdMockupCard> = {
  title: 'Features/ExploreAdMockup/Card',
  component: ExploreAdMockupCard,
  parameters: { layout: 'fullscreen' },
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

const Page = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-background-default p-8">
    <h1 className="mb-1 font-bold text-text-primary typo-title1">{title}</h1>
    <p className="mb-8 text-text-tertiary typo-callout">{subtitle}</p>
    {children}
  </div>
);

// Every creative in the campaign (6 products × 2 headline versions), grid card.
// This is the one-page overview to screenshot for the advertiser.
export const AllCreativesGrid: Story = {
  render: () => (
    <Page
      title="Google Cloud on daily.dev — Explore feed"
      subtitle="Advertiser card placements · 6 products × 2 headline versions"
    >
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        {creatives.map((creative) => (
          <ExploreAdMockupCard
            key={creative.placement.id}
            creative={creative}
          />
        ))}
      </div>
    </Page>
  ),
};

// The randomizer: each card picks a different creative, spread by feed index.
export const RandomizedGrid: Story = {
  render: () => (
    <Page
      title="Randomizer preview"
      subtitle="Each Explore-feed ad slot shows a random creative; refreshing reshuffles"
    >
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ExploreAdMockupCard key={`rand-${i}`} feedIndex={i} />
        ))}
      </div>
    </Page>
  ),
};

// List-layout variant (list feed / mobile).
export const AllCreativesList: Story = {
  render: () => (
    <Page
      title="Google Cloud on daily.dev — list layout"
      subtitle="Advertiser card placements · list / mobile feed variant"
    >
      <div className="flex max-w-2xl flex-col gap-4">
        {creatives.map((creative) => (
          <ExploreAdMockupCard
            key={creative.placement.id}
            isList
            creative={creative}
          />
        ))}
      </div>
    </Page>
  ),
};
