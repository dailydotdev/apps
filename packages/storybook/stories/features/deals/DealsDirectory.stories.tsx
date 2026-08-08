import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealsRail } from '@dailydotdev/shared/src/features/deals/components/DealsRail';
import { DealListCard } from '@dailydotdev/shared/src/features/deals/components/DealListCard';
import { DealCard } from '@dailydotdev/shared/src/features/deals/components/DealCard';
import { DealsHero } from '@dailydotdev/shared/src/features/deals/components/DealsHero';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
import { DealState } from '@dailydotdev/shared/src/features/deals/types';
import {
  getDealCoverMedia,
  getDealsDirectoryEvidence,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import {
  getDealsByState,
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const meta: Meta<typeof DealsDirectoryPage> = {
  title: 'Features/Deals/Directory',
  component: DealsDirectoryPage,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof DealsDirectoryPage>;

const noop = (): void => undefined;

export const FullPage: Story = {
  render: () => <DealsDirectoryPage deals={mockDeals} onDealClick={noop} />,
};

export const LoggedOut: Story = {
  decorators: [withDeals({ isLoggedOut: true })],
  render: () => (
    <DealsDirectoryPage deals={mockDeals} isLoggedOut onDealClick={noop} />
  ),
};

export const SearchNoResults: Story = {
  render: () => (
    <DealsDirectoryPage
      deals={mockDeals}
      initialQuery="blockchain toaster"
      onDealClick={noop}
    />
  ),
};

export const FilterExpiring: Story = {
  render: () => (
    <DealsDirectoryPage
      deals={mockDeals}
      initialFilter="Expiring"
      onDealClick={noop}
    />
  ),
};

const ClaimLoopDemo = () => {
  const dealsState = useDealsMockState({ now: MOCK_NOW_MS });

  return (
    <div className="flex flex-col gap-10 pb-16">
      <DealsDirectoryPage
        deals={mockDeals}
        state={dealsState}
        now={MOCK_NOW_MS}
        onDealClick={noop}
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 tablet:px-8 laptop:px-12">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
          My coupons, fed by the same claims
        </span>
        <MyCouponsWallet
          claims={dealsState.claims}
          deals={mockDeals}
          now={MOCK_NOW_MS}
          onBrowse={noop}
        />
      </div>
    </div>
  );
};

export const ClaimLoop: Story = {
  render: () => <ClaimLoopDemo />,
};

const RailsDemo = () => {
  const [claimed, setClaimed] = useState<string | null>(null);
  const live = mockDeals.filter(isLiveDeal);

  return (
    <div className="flex flex-col gap-10">
      <DealsHero query="" onQueryChange={noop} />
      <DealsRail
        title="Ending soon"
        deals={getDealsByState(DealState.Expiring)}
        now={MOCK_NOW_MS}
        onClaim={(deal) => setClaimed(deal.title)}
      />
      <DealsRail
        title="Trending"
        deals={[...live]
          .sort((a, b) => b.community.upvotes - a.community.upvotes)
          .slice(0, 8)}
        now={MOCK_NOW_MS}
        onClaim={(deal) => setClaimed(deal.title)}
        onShare={noop}
      />
      <DealsRail
        title="New this week"
        deals={live.slice(0, 8)}
        now={MOCK_NOW_MS}
        onClaim={(deal) => setClaimed(deal.title)}
      />
      <DealsRail
        title="For you"
        label="Based on your tags"
        deals={live
          .filter(({ categories }) =>
            categories.some((category) =>
              ['AI tools', 'Dev tools', 'Cloud'].includes(category),
            ),
          )
          .slice(0, 8)}
        now={MOCK_NOW_MS}
        onClaim={(deal) => setClaimed(deal.title)}
      />
      {claimed && (
        <span className="text-text-tertiary typo-callout">
          Last claim clicked: {claimed}
        </span>
      )}
    </div>
  );
};

export const RailsOnly: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => <RailsDemo />,
};

/**
 * Every cover sits in an `aspect-[3/1]` box, so each card reserves its image
 * row before the photo arrives and the rail never reflows as they load in.
 */
export const CoverRail: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-10">
      <DealsRail
        title="Deals with a cover image"
        deals={mockDeals.filter((deal) => !!getDealCoverMedia(deal))}
        now={MOCK_NOW_MS}
        onClaim={noop}
        onShare={noop}
      />
      <DealsRail
        title="Brand led, no cover slot"
        deals={mockDeals
          .filter((deal) => isLiveDeal(deal) && !getDealCoverMedia(deal))
          .slice(0, 6)}
        now={MOCK_NOW_MS}
        onClaim={noop}
        onShare={noop}
      />
    </div>
  ),
};

/**
 * Rails keep the grid card, the exhaustive listing uses the list row. Check
 * both at `mobile` too: the list row reflows its value under the title rather
 * than compressing it.
 */
export const ListVersusGrid: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
          List rows, the all deals section
        </span>
        <ul className="flex flex-col gap-3">
          {mockDeals.slice(0, 6).map((deal) => (
            <DealListCard
              key={deal.id}
              deal={deal}
              now={MOCK_NOW_MS}
              onClaim={noop}
              onShare={noop}
            />
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
          Grid cards, the rails
        </span>
        <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
          {mockDeals.slice(0, 6).map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              now={MOCK_NOW_MS}
              onClaim={noop}
              onShare={noop}
              onUpvote={noop}
            />
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * The affiliate disclosure lives once, in the hero, above the fold and away
 * from every CTA. It is no longer repeated on each card or in the footer.
 */
export const PageLevelDisclosure: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <DealsHero
      query=""
      onQueryChange={noop}
      evidence={getDealsDirectoryEvidence(mockDeals.filter(isLiveDeal))}
    />
  ),
};
