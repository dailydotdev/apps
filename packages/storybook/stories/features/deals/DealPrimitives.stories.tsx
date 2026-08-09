import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealValueBadge } from '@dailydotdev/shared/src/features/deals/components/DealValueBadge';
import { DealBadge } from '@dailydotdev/shared/src/features/deals/components/DealBadge';
import { DealCaveatStrip } from '@dailydotdev/shared/src/features/deals/components/DealCaveatStrip';
import { DealCaveats } from '@dailydotdev/shared/src/features/deals/components/DealCaveats';
import { DealRedemptionNote } from '@dailydotdev/shared/src/features/deals/components/DealRedemptionNote';
import { DealVerification } from '@dailydotdev/shared/src/features/deals/components/DealVerification';
import {
  DealBrandLogo,
  DealBrandTileSize,
} from '@dailydotdev/shared/src/features/deals/components/DealBrandLogo';
import { DealCommunityProof } from '@dailydotdev/shared/src/features/deals/components/DealCommunityProof';
import { DealInviteProgress } from '@dailydotdev/shared/src/features/deals/components/DealInviteProgress';
import { DealImpactWidget } from '@dailydotdev/shared/src/features/deals/components/DealImpactWidget';
import { DealsDirectoryHeader } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryHeader';
import {
  DEALS_FILTER_ALL,
  getDealBrands,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import type {
  Deal,
  DealBrand,
} from '@dailydotdev/shared/src/features/deals/types';
import {
  DealCaveatKind,
  DealState,
  DealType,
} from '@dailydotdev/shared/src/features/deals/types';
import { mockDeals, MOCK_NOW_MS, withDeals } from './deals.mocks';

const findDeal = (slug: string): Deal => {
  const deal = mockDeals.find((candidate) => candidate.slug === slug);

  if (!deal) {
    throw new Error(`Missing mock deal for slug ${slug}`);
  }

  return deal;
};

const meta: Meta = {
  title: 'Features/Deals/Primitives',
  parameters: { layout: 'padded', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof meta>;

const hoursFromMockNow = (hours: number): string =>
  new Date(MOCK_NOW_MS + hours * 60 * 60 * 1000).toISOString();

const Case = ({
  label,
  testId,
  children,
}: {
  label: string;
  testId: string;
  children: ReactNode;
}) => (
  <div data-testid={testId} className="flex flex-col items-start gap-2">
    <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
      {label}
    </span>
    {children}
  </div>
);

const Grid = ({ children }: { children: ReactNode }) => (
  <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
    {children}
  </div>
);

export const ValueBadge: Story = {
  render: () => (
    <Grid>
      <Case label="Percentage" testId="value-badge-percent">
        <DealValueBadge value={{ label: '-30%', savingsUsd: 60 }} />
      </Case>
      <Case label="Cash credit" testId="value-badge-credit">
        <DealValueBadge value={{ label: '$200 free', savingsUsd: 200 }} />
      </Case>
      <Case label="Free months" testId="value-badge-months">
        <DealValueBadge value={{ label: '3 mo free', savingsUsd: 117 }} />
      </Case>
      <Case label="No savings figure" testId="value-badge-no-savings">
        <DealValueBadge value={{ label: 'Members only' }} />
      </Case>
      <Case label="Muted" testId="value-badge-muted">
        <DealValueBadge value={{ label: '-30%' }} isMuted />
      </Case>
      <Case label="Long label" testId="value-badge-long">
        <DealValueBadge value={{ label: '$1,200 of credit over 12 months' }} />
      </Case>
    </Grid>
  ),
};

const badgeBase = findDeal('cursor-20-credit');

/**
 * One badge per deal, resolved by a fixed precedence. The last case stacks
 * every input at once and still renders a single label.
 */
export const StatusBadge: Story = {
  render: () => (
    <Grid>
      <Case label="Community pick" testId="badge-community-pick">
        <DealBadge
          deal={{ ...badgeBase, isCommunityPick: true }}
          now={MOCK_NOW_MS}
        />
      </Case>
      <Case label="Trending" testId="badge-trending">
        <DealBadge deal={badgeBase} now={MOCK_NOW_MS} isTrending />
      </Case>
      <Case label="Community pick beats trending" testId="badge-pick-over-hot">
        <DealBadge
          deal={{ ...badgeBase, isCommunityPick: true }}
          now={MOCK_NOW_MS}
          isTrending
        />
      </Case>
      <Case label="Members only" testId="badge-members-only">
        <DealBadge
          deal={{ ...badgeBase, type: DealType.Exclusive }}
          now={MOCK_NOW_MS}
        />
      </Case>
      <Case label="Ending soon" testId="badge-ending-soon">
        <DealBadge
          deal={{
            ...badgeBase,
            state: DealState.Expiring,
            expiresAt: hoursFromMockNow(52),
            validThrough: hoursFromMockNow(52),
          }}
          now={MOCK_NOW_MS}
        />
      </Case>
      <Case label="Promoted beats merit" testId="badge-promoted">
        <DealBadge
          deal={{ ...badgeBase, isPromoted: true, isCommunityPick: true }}
          now={MOCK_NOW_MS}
        />
      </Case>
      <Case label="Sold out" testId="badge-sold-out">
        <DealBadge
          deal={{ ...badgeBase, state: DealState.SoldOut }}
          now={MOCK_NOW_MS}
        />
      </Case>
      <Case label="No badge earned" testId="badge-none">
        <DealBadge deal={badgeBase} now={MOCK_NOW_MS} />
      </Case>
      <Case label="Everything at once, still one" testId="badge-precedence">
        <DealBadge
          deal={{
            ...badgeBase,
            state: DealState.Expired,
            isPromoted: true,
            isCommunityPick: true,
            type: DealType.Exclusive,
            expiresAt: hoursFromMockNow(-3),
            validThrough: hoursFromMockNow(-3),
          }}
          now={MOCK_NOW_MS}
          isTrending
        />
      </Case>
    </Grid>
  ),
};

const threeCaveatDeal = findDeal('frontend-masters-3-months-free');
const oneCaveatDeal = findDeal('figma-professional-35-off');
const noCaveatDeal = findDeal('sentry-50-credit');

export const CaveatStrip: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      <Case label="One caveat" testId="caveat-strip-one">
        <DealCaveatStrip deal={oneCaveatDeal} />
      </Case>
      <Case label="Two caveats, the cap" testId="caveat-strip-two">
        <DealCaveatStrip deal={findDeal('digitalocean-200-credit')} />
      </Case>
      <Case label="Three caveats, truncated" testId="caveat-strip-truncated">
        <DealCaveatStrip deal={threeCaveatDeal} />
      </Case>
      <Case label="No caveats, nothing renders" testId="caveat-strip-empty">
        <DealCaveatStrip deal={noCaveatDeal} />
      </Case>
    </div>
  ),
};

export const WorthKnowing: Story = {
  render: () => (
    <div className="flex max-w-2xl flex-col gap-8">
      <Case label="Three caveats" testId="worth-knowing-three">
        <DealCaveats deal={threeCaveatDeal} className="w-full" />
      </Case>
      <Case label="One caveat" testId="worth-knowing-one">
        <DealCaveats deal={oneCaveatDeal} className="w-full" />
      </Case>
      <Case
        label="Every kind in the taxonomy"
        testId="worth-knowing-every-kind"
      >
        <DealCaveats
          deal={{
            ...threeCaveatDeal,
            caveats: Object.values(DealCaveatKind).map((kind) => ({
              kind,
              label: kind.replace(/_/g, ' '),
              detail: `Detail copy for the ${kind.replace(
                /_/g,
                ' ',
              )} restriction, stated flatly and then explained.`,
            })),
          }}
          className="w-full"
        />
      </Case>
    </div>
  ),
};

export const RedemptionNote: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      {mockDeals.slice(0, 6).map((deal) => (
        <Case
          key={deal.id}
          label={deal.brand.name}
          testId={`redemption-${deal.slug}`}
        >
          <DealRedemptionNote deal={deal} />
        </Case>
      ))}
      <Case label="No authored note, type default" testId="redemption-default">
        <DealRedemptionNote
          deal={{ ...badgeBase, redemptionNote: undefined }}
        />
      </Case>
    </div>
  ),
};

/**
 * Below 25 reports the block must never print a percentage. Compare the two
 * cases: the same deal, a different denominator.
 */
export const Verification: Story = {
  render: () => (
    <div className="flex max-w-3xl flex-col gap-10">
      <Case label="Above the sample floor" testId="verification-rated">
        <DealVerification
          deal={findDeal('digitalocean-200-credit')}
          now={MOCK_NOW_MS}
          className="w-full"
        />
      </Case>
      <Case label="Below the sample floor" testId="verification-unrated">
        <DealVerification
          deal={{
            ...findDeal('digitalocean-200-credit'),
            community: {
              ...findDeal('digitalocean-200-credit').community,
              claims: 4,
              worksRate: 0.96,
            },
          }}
          now={MOCK_NOW_MS}
          className="w-full"
        />
      </Case>
    </div>
  ),
};

export const BrandLogo: Story = {
  render: () => (
    <Grid>
      <Case label="Remote logo" testId="brand-logo-remote">
        <DealBrandLogo
          brand={{
            id: 'b-vercel',
            name: 'Vercel',
            logoUrl: 'https://svgl.app/library/vercel_wordmark.svg',
            domain: 'vercel.com',
          }}
        />
      </Case>
      <Case label="No logo, favicon resolves" testId="brand-logo-monogram">
        <DealBrandLogo
          brand={{
            id: 'b-cursor',
            name: 'Cursor',
            logoUrl: null,
            domain: 'cursor.com',
            accent: '#6C5CE7',
          }}
        />
      </Case>
      <Case label="Logo fails, favicon takes over" testId="brand-logo-failed">
        <DealBrandLogo
          brand={{
            id: 'b-broken',
            name: 'monday.com',
            logoUrl: 'https://svgl.app/library/this-file-does-not-exist.svg',
            domain: 'monday.com',
            accent: '#FF3D57',
          }}
        />
      </Case>
      <Case
        label="No logo and no domain, monogram wins"
        testId="brand-logo-monogram-fallback"
      >
        <DealBrandLogo
          brand={{
            id: 'b-unresolvable',
            name: 'Frontend Masters',
            logoUrl: null,
            domain: '',
            accent: '#C02D28',
          }}
        />
      </Case>
      <Case label="Muted" testId="brand-logo-muted">
        <DealBrandLogo
          brand={{
            id: 'b-sentry',
            name: 'Sentry',
            logoUrl: null,
            domain: 'sentry.io',
          }}
          isMuted
        />
      </Case>
      <Case label="Large" testId="brand-logo-large">
        <DealBrandLogo
          brand={{
            id: 'b-fem',
            name: 'Frontend Masters',
            logoUrl: null,
            domain: 'frontendmasters.com',
          }}
          className="size-14 rounded-16"
        />
      </Case>
    </Grid>
  ),
};

const TILE_SIZES: { label: string; size: DealBrandTileSize }[] = [
  { label: '64 to 80 list thumbnail', size: DealBrandTileSize.Thumbnail },
  { label: '56 card cover', size: DealBrandTileSize.Cover },
  { label: '40 chip and wallet', size: DealBrandTileSize.Chip },
  { label: '32 badge over cover', size: DealBrandTileSize.Badge },
];

const EDGE_CASE_BRANDS: DealBrand[] = [
  {
    id: 'b-edge-no-accent',
    name: 'Plain Brand',
    logoUrl: 'https://cdn.simpleicons.org/nextdotjs',
    domain: 'nextjs.org',
  },
  {
    id: 'b-edge-dead-url',
    name: 'Dead Link',
    logoUrl: 'https://svgl.app/library/this-file-does-not-exist.svg',
    domain: 'stripe.com',
    accent: '#635BFF',
  },
  {
    id: 'b-edge-monogram',
    name: 'Frontend Masters',
    logoUrl: null,
    domain: '',
    accent: '#C40D0D',
  },
  {
    id: 'b-edge-monogram-plain',
    name: 'Keychron',
    logoUrl: null,
    domain: '',
  },
];

const TileRow = ({
  brands,
  label,
  size,
}: {
  brands: DealBrand[];
  label: string;
  size: DealBrandTileSize;
}) => (
  <div className="flex flex-col gap-2">
    <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
      {label}
    </span>
    <div className="flex flex-wrap items-end gap-3">
      {brands.map((brand) => (
        <DealBrandLogo key={brand.id} brand={brand} size={size} />
      ))}
    </div>
  </div>
);

const TileSystemPanel = ({ brands }: { brands: DealBrand[] }) => (
  <div className="flex flex-col gap-6 rounded-16 bg-background-default p-5">
    {TILE_SIZES.map(({ label, size }) => (
      <TileRow key={label} brands={brands} label={label} size={size} />
    ))}
    <div className="flex flex-col gap-2">
      <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
        Muted, claimed or expired
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {brands.slice(0, 8).map((brand) => (
          <DealBrandLogo
            key={brand.id}
            brand={brand}
            size={DealBrandTileSize.Cover}
            isMuted
          />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Twenty brands from three different logo sources have to read as one set, so
 * the story puts every size and both themes on a single screen.
 */
export const BrandTileSystem: Story = {
  render: () => {
    const brands = [...getDealBrands(mockDeals), ...EDGE_CASE_BRANDS];

    return (
      <div className="flex flex-col gap-6">
        <TileSystemPanel brands={brands} />
        <div className="invert">
          <TileSystemPanel brands={brands} />
        </div>
      </div>
    );
  },
};

export const CommunityProof: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-6">
      <Case label="Fresh verification" testId="proof-fresh">
        <DealCommunityProof
          community={{
            upvotes: 1204,
            comments: 88,
            claims: 2411,
            worksRate: 0.93,
            lastVerifiedAt: hoursFromMockNow(-0.6),
          }}
          className="w-full"
        />
      </Case>
      <Case label="Stale verification" testId="proof-stale">
        <DealCommunityProof
          community={{
            upvotes: 32,
            comments: 2,
            claims: 41,
            worksRate: 0.42,
            lastVerifiedAt: hoursFromMockNow(-624),
          }}
          className="w-full"
        />
      </Case>
      <Case label="Below the sample floor" testId="proof-unrated">
        <DealCommunityProof
          community={{
            upvotes: 12,
            comments: 1,
            claims: 4,
            worksRate: 1,
            lastVerifiedAt: hoursFromMockNow(-2),
          }}
          className="w-full"
        />
      </Case>
      <Case label="Muted, on a closed deal" testId="proof-muted">
        <DealCommunityProof
          community={{
            upvotes: 512,
            comments: 37,
            claims: 1640,
            worksRate: 0.85,
            lastVerifiedAt: hoursFromMockNow(-96),
          }}
          isMuted
          className="w-full"
        />
      </Case>
    </div>
  ),
};

export const InviteProgress: Story = {
  render: () => (
    <Grid>
      <Case label="0 of 2" testId="invite-progress-0">
        <DealInviteProgress invites={{ required: 2, done: 0 }} />
      </Case>
      <Case label="1 of 2" testId="invite-progress-1">
        <DealInviteProgress invites={{ required: 2, done: 1 }} />
      </Case>
      <Case label="2 of 2" testId="invite-progress-2">
        <DealInviteProgress invites={{ required: 2, done: 2 }} />
      </Case>
      <Case label="0 of 5, large" testId="invite-progress-large-0">
        <DealInviteProgress invites={{ required: 5, done: 0 }} isLarge />
      </Case>
      <Case label="5 of 5, large" testId="invite-progress-large-5">
        <DealInviteProgress invites={{ required: 5, done: 5 }} isLarge />
      </Case>
    </Grid>
  ),
};

const DirectoryHeaderDemo = () => {
  const [filter, setFilter] = useState(DEALS_FILTER_ALL);
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <Case label="Full width, tabs and search" testId="directory-header-full">
        <DealsDirectoryHeader
          deals={mockDeals}
          activeFilter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
          className="w-full"
        />
      </Case>
      <Case
        label="Narrow column, the tabs scroll"
        testId="directory-header-narrow"
      >
        <div className="w-72">
          <DealsDirectoryHeader
            deals={mockDeals}
            activeFilter={filter}
            onFilterChange={setFilter}
            query={query}
            onQueryChange={setQuery}
          />
        </div>
      </Case>
    </div>
  );
};

export const DirectoryHeader: Story = {
  render: () => <DirectoryHeaderDemo />,
};

export const ImpactStrip: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Case label="Nothing claimed" testId="impact-empty">
        <DealImpactWidget
          claimedCount={0}
          totalSavedUsd={0}
          invitesDone={0}
          invitesRequired={2}
          className="w-full"
        />
      </Case>
      <Case label="Mid progress" testId="impact-mid">
        <DealImpactWidget
          claimedCount={4}
          totalSavedUsd={211}
          invitesDone={1}
          invitesRequired={2}
          className="w-full"
        />
      </Case>
      <Case label="Invites complete" testId="impact-complete">
        <DealImpactWidget
          claimedCount={12}
          totalSavedUsd={1480}
          invitesDone={2}
          invitesRequired={2}
          className="w-full"
        />
      </Case>
    </div>
  ),
};
