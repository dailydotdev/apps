import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealsDirectoryHeader } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryHeader';
import { DealsRail } from '@dailydotdev/shared/src/features/deals/components/DealsRail';
import { DealListCard } from '@dailydotdev/shared/src/features/deals/components/DealListCard';
import { DealCard } from '@dailydotdev/shared/src/features/deals/components/DealCard';
import { DealsHero } from '@dailydotdev/shared/src/features/deals/components/DealsHero';
import { DealsCategoryGrid } from '@dailydotdev/shared/src/features/deals/components/DealsCategoryGrid';
import { DealImpactWidget } from '@dailydotdev/shared/src/features/deals/components/DealImpactWidget';
import { MyCouponsWallet } from '@dailydotdev/shared/src/features/deals/components/MyCouponsWallet';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { DealState } from '@dailydotdev/shared/src/features/deals/types';
import {
  DEALS_FILTER_ALL,
  getDealCoverMedia,
  getDealsDirectoryEvidence,
  getTrendingDealIds,
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

const trendingDealIds = getTrendingDealIds(mockDeals);

/**
 * The shape of the page: title, header tabs with the search field, one grid
 * rail of the deals picked for you, then every deal as a list row. Ending
 * soon, Community pick and Trending are badges on those rows now, not rails of
 * their own. The impact strip closes the page instead of taking a column
 * beside it.
 */
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

/**
 * A category tab is a link to its own crawlable page, so this is what
 * `/deals/c/dev-tools` renders: no rail, the category tab active, and the
 * offers as rows. A facet is already a set the reader chose, so picking a
 * subset of it for them says nothing.
 */
export const CategoryTab: Story = {
  render: () => (
    <DealsDirectoryPage
      deals={mockDeals.filter(({ categories }) =>
        categories.includes('Dev tools'),
      )}
      filterDeals={mockDeals}
      heading="Dev tools deals"
      resultsTitle="Dev tools deals"
      initialFilter="Dev tools"
      withForYouRail={false}
      onDealClick={noop}
    />
  ),
};

/** The two cross-cutting tabs stay a filter on the directory itself. */
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

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
    {children}
  </span>
);

const DirectoryHeaderDemo = () => {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-3">
      <DealsDirectoryHeader
        deals={mockDeals}
        activeFilter={DEALS_FILTER_ALL}
        query={query}
        onQueryChange={setQuery}
      />
      <SectionLabel>
        Every tab is a link, so the route decides which one is active. Search:{' '}
        {query || 'empty'}
      </SectionLabel>
    </div>
  );
};

/**
 * Categories are links to `/deals/c/<slug>`, so a crawler that never clicks a
 * filter still reaches every faceted page. Expiring and Exclusive cut across
 * every category, so they stay a query on the directory rather than a second
 * thin URL for the same offers. The strip is the same page-header navbar the
 * squads, tags and explore directories use. Check this at `mobile`: the tab
 * row scrolls on its own beside a narrower search field.
 */
export const Header: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => <DirectoryHeaderDemo />,
};

/**
 * The category browser, borrowed from how the PartnerStack marketplace opens:
 * a tile per category with the reward stated before the name is even read.
 * Heaviest shelf first, so the catalogue's centre of gravity is the first
 * thing on screen, and every tile is a real link to its faceted page.
 *
 * A category that sells objects is photographed, up to three products in a
 * mosaic around a hero. One that sells subscriptions shows its brands on a
 * panel tinted by the first of them. Check both at `mobile`: the marks step
 * down a size where three of them would be wider than a two-column card.
 */
export const CategoryGrid: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => <DealsCategoryGrid deals={mockDeals.filter(isLiveDeal)} />,
};

const ForYouRailDemo = () => {
  const [claimed, setClaimed] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <DealsHero />
      <DealsRail
        title="For you"
        label="Based on your tags"
        deals={mockDeals
          .filter(
            (deal) =>
              isLiveDeal(deal) &&
              deal.categories.some((category) =>
                ['AI tools', 'Dev tools', 'Cloud'].includes(category),
              ),
          )
          .slice(0, 8)}
        trendingDealIds={trendingDealIds}
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

/**
 * The only rail left. It is the one section a list cannot express, because it
 * is the one section whose contents depend on who is reading. Ending soon,
 * Community picks and Trending are badges on the rows now, and New this week
 * is gone: nearly every offer in the directory qualified for it.
 */
export const ForYouRail: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => <ForYouRailDemo />,
};

const badgedRowCases: { label: string; deal: Deal; isTrending?: boolean }[] = [
  {
    label: 'Ending soon, the countdown replaces the rail',
    deal: getDealsByState(DealState.Expiring)[0],
  },
  {
    label: 'Community pick',
    deal: findDeal('keychron-q1-30-off'),
  },
  {
    label: 'Trending, top six by upvotes among the live offers',
    deal: findDeal('linear-3-months-free'),
    isTrending: true,
  },
  {
    label: 'Trending and a community pick, the editorial label wins',
    deal: findDeal('digitalocean-200-credit'),
    isTrending: true,
  },
  {
    label: 'Trending and members only, trending wins',
    deal: findDeal('raycast-pro-year-members-only'),
    isTrending: true,
  },
  {
    label: 'Ending soon, community pick and trending at once, the clock wins',
    deal: {
      ...getDealsByState(DealState.Expiring)[1],
      isCommunityPick: true,
    },
    isTrending: true,
  },
];

/**
 * The three deleted rails, side by side as rows. Every row still carries
 * exactly one badge: the precedence runs Expired, Sold out, Promoted, Ending
 * soon, pool left, Community pick, Trending, Members only, so an offer that
 * earns three of them still prints the most consequential one.
 */
export const RowBadges: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      {badgedRowCases.map(({ label, deal, isTrending }) => (
        <div key={label} className="flex flex-col gap-1">
          <SectionLabel>{label}</SectionLabel>
          <ul className="flex flex-col">
            <DealListCard
              deal={deal}
              isTrending={isTrending}
              now={MOCK_NOW_MS}
              onClaim={noop}
            />
          </ul>
        </div>
      ))}
    </div>
  ),
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
      />
      <DealsRail
        title="Brand led, no cover slot"
        deals={mockDeals
          .filter((deal) => isLiveDeal(deal) && !getDealCoverMedia(deal))
          .slice(0, 6)}
        now={MOCK_NOW_MS}
        onClaim={noop}
      />
    </div>
  ),
};

const comparisonDeals = mockDeals.slice(0, 6);

/**
 * The two forms on the same six offers. The grid card is now reserved for the
 * one rail, where a deal is there because we picked it for you and the cover
 * earns its space. Everything else is a row: six of them fit in roughly the
 * height of two cards, carrying the same decision set.
 */
export const CardVersusRow: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-10 laptop:flex-row laptop:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <SectionLabel>List rows, every deal outside a rail</SectionLabel>
        <ul className="flex flex-col">
          {comparisonDeals.map((deal) => (
            <DealListCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
          ))}
        </ul>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <SectionLabel>Grid cards, the rails only</SectionLabel>
        <div className="grid gap-6 tablet:grid-cols-2">
          {comparisonDeals.map((deal) => (
            <DealCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
          ))}
        </div>
      </div>
    </div>
  ),
};

/**
 * The brand is the first thing the row and the card say, and it says it once.
 * A cover photo carries the mark as a chip beside it, a brand led offer puts
 * the mark in the cover itself and prints the name alone.
 */
export const BrandProminence: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionLabel>Rows</SectionLabel>
      <ul className="flex flex-col">
        {[
          findDeal('keychron-q1-30-off'),
          findDeal('cursor-20-credit'),
          findDeal('amazon-10-gift-card'),
        ].map((deal) => (
          <DealListCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
        ))}
      </ul>
      <SectionLabel>Cards</SectionLabel>
      <div className="grid gap-6 tablet:grid-cols-3">
        {[
          findDeal('keychron-q1-30-off'),
          findDeal('cursor-20-credit'),
          findDeal('amazon-10-gift-card'),
        ].map((deal) => (
          <DealCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
        ))}
      </div>
    </div>
  ),
};

/**
 * The link button on a row or a card copies the canonical
 * `https://app.daily.dev/deals/<slug>`. Click it: the icon swaps to a check
 * for a second, a toast confirms it, and a live region announces it to a
 * screen reader.
 */
export const CopyLink: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-6">
      <SectionLabel>Row</SectionLabel>
      <ul className="flex flex-col">
        <DealListCard deal={findDeal('cursor-20-credit')} now={MOCK_NOW_MS} />
      </ul>
      <SectionLabel>Card</SectionLabel>
      <div className="w-80">
        <DealCard deal={findDeal('cursor-20-credit')} now={MOCK_NOW_MS} />
      </div>
    </div>
  ),
};

const rowStateCases: { label: string; deal: Deal }[] = [
  {
    label: 'Product photo, the brand mark sits over its corner',
    deal: findDeal('keychron-q1-30-off'),
  },
  { label: 'Brand logo, no product photo', deal: findDeal('cursor-20-credit') },
  { label: 'Gift card artwork', deal: findDeal('amazon-10-gift-card') },
  {
    label: 'No caveats, the alert row is absent',
    deal: { ...findDeal('cursor-20-credit'), caveats: [] },
  },
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
      {rowStateCases.map(({ label, deal }) => (
        <div key={label} className="flex flex-col gap-1">
          <SectionLabel>{label}</SectionLabel>
          <ul className="flex flex-col">
            <DealListCard deal={deal} now={MOCK_NOW_MS} onClaim={noop} />
          </ul>
        </div>
      ))}
    </div>
  ),
};

const actionColumnCases: { label: string; deal: Deal; isClaimed?: boolean }[] =
  [
    { label: 'Live', deal: findDeal('cursor-20-credit') },
    {
      label: 'Live, ending soon',
      deal: getDealsByState(DealState.Expiring)[0],
    },
    {
      label: 'Locked behind Cores',
      deal: findDeal('cursor-pro-month-for-cores'),
    },
    { label: 'Locked behind invites', deal: findDeal('linear-3-months-free') },
    {
      label: 'Locked behind Cores or invites',
      deal: findDeal('raycast-pro-year-members-only'),
    },
    {
      label: 'Claimed by me',
      deal: findDeal('figma-professional-35-off'),
      isClaimed: true,
    },
    { label: 'Sold out', deal: getDealsByState(DealState.SoldOut)[0] },
    { label: 'Expired', deal: getDealsByState(DealState.Expired)[0] },
  ];

/**
 * One claim verb down the whole column. Read the right edge top to bottom: the
 * primary button starts at the same x on every row whatever its state, the
 * copy link sits to its left, and only the three non-actions (claimed, sold
 * out, expired) drop the primary variant.
 */
export const ActionColumn: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col">
        {actionColumnCases.map(({ label, deal, isClaimed }) => (
          <DealListCard
            key={label}
            deal={deal}
            now={MOCK_NOW_MS}
            isClaimedByMe={isClaimed}
            onClaim={noop}
          />
        ))}
      </ul>
      <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
        {actionColumnCases.map(({ label, deal, isClaimed }) => (
          <DealCard
            key={label}
            deal={deal}
            now={MOCK_NOW_MS}
            isClaimedByMe={isClaimed}
            onClaim={noop}
          />
        ))}
      </div>
    </div>
  ),
};

/**
 * The impact numbers used to be a tall card in a right rail, competing with
 * the deals for width. Same numbers and same invite progress, now one quiet
 * strip that closes the page.
 */
export const ImpactStrip: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-4">
      <DealImpactWidget
        claimedCount={0}
        totalSavedUsd={0}
        invitesDone={0}
        invitesRequired={2}
      />
      <DealImpactWidget
        claimedCount={4}
        totalSavedUsd={211}
        invitesDone={1}
        invitesRequired={2}
      />
      <DealImpactWidget
        claimedCount={12}
        totalSavedUsd={1480}
        invitesDone={2}
        invitesRequired={2}
      />
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
      evidence={getDealsDirectoryEvidence(mockDeals.filter(isLiveDeal))}
    />
  ),
};
