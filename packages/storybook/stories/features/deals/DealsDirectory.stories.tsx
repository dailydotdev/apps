import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealsRail } from '@dailydotdev/shared/src/features/deals/components/DealsRail';
import { DealListCard } from '@dailydotdev/shared/src/features/deals/components/DealListCard';
import { DealCard } from '@dailydotdev/shared/src/features/deals/components/DealCard';
import { DealsHero } from '@dailydotdev/shared/src/features/deals/components/DealsHero';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { DealState } from '@dailydotdev/shared/src/features/deals/types';
import {
  getDealCoverMedia,
  getDealsDirectoryEvidence,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import { useDealsMockState } from '@dailydotdev/shared/src/features/deals/useDealsMockState';
import {
  getDealBySlug,
  getDealsByState,
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const findDeal = (slug: string): Deal => {
  const deal = getDealBySlug(slug);

  if (!deal) {
    throw new Error(`Missing mock deal for slug ${slug}`);
  }

  return deal;
};

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

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
    {children}
  </span>
);

const comparisonDeals = mockDeals.slice(0, 6);

/**
 * The density argument, side by side and on the same six offers. The list is
 * the directory default: six rows fit in roughly the height of two grid cards,
 * and every row carries the same decision set (thumbnail, brand, one badge,
 * title, one caveat, one proof line, value, CTA).
 */
export const ListVersusGrid: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-10 laptop:flex-row laptop:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <SectionLabel>List rows, the directory default</SectionLabel>
        <ul className="flex flex-col">
          {comparisonDeals.map((deal) => (
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
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <SectionLabel>Grid cards, the rails and the grid view</SectionLabel>
        <div className="grid gap-6 tablet:grid-cols-2">
          {comparisonDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              now={MOCK_NOW_MS}
              onClaim={noop}
              onShare={noop}
            />
          ))}
        </div>
      </div>
    </div>
  ),
};

const productRowDeal = findDeal('keychron-q1-30-off');
const brandRowDeal = findDeal('cursor-20-credit');
const artworkRowDeal = findDeal('amazon-10-gift-card');
const noCaveatRowDeal: Deal = { ...brandRowDeal, caveats: [] };

const rowCases: { label: string; deal: Deal }[] = [
  { label: 'Product photo in the thumbnail slot', deal: productRowDeal },
  { label: 'Brand logo, no product photo', deal: brandRowDeal },
  { label: 'Gift card artwork', deal: artworkRowDeal },
  { label: 'No caveats, the alert row is absent', deal: noCaveatRowDeal },
  {
    label: 'Expiring, the countdown is the badge',
    deal: getDealsByState(DealState.Expiring)[0],
  },
  {
    label: 'Locked behind invites',
    deal: findDeal('linear-3-months-free'),
  },
  {
    label: 'Locked behind Cores, the cost sits beside the value',
    deal: findDeal('cursor-pro-month-for-cores'),
  },
  {
    label: 'Locked behind Cores or invites, Cores takes the CTA',
    deal: findDeal('raycast-pro-year-members-only'),
  },
  { label: 'Sold out', deal: getDealsByState(DealState.SoldOut)[0] },
  { label: 'Expired', deal: getDealsByState(DealState.Expired)[0] },
];

/**
 * Every row shape in one place. The thumbnail box is a fixed square, so a
 * missing photo, a failed photo and a monogram all reserve the same space and
 * the list never reflows as images arrive. Check this at `mobile` too: the
 * value, saving and CTA stack under the title instead of compressing.
 */
export const RowStates: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      {rowCases.map(({ label, deal }) => (
        <div key={label} className="flex flex-col gap-1">
          <SectionLabel>{label}</SectionLabel>
          <ul className="flex flex-col">
            <DealListCard
              deal={deal}
              now={MOCK_NOW_MS}
              onClaim={noop}
              onShare={noop}
            />
          </ul>
        </div>
      ))}
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
