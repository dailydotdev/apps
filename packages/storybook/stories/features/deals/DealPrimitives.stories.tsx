import type { ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealValueBadge } from '@dailydotdev/shared/src/features/deals/components/DealValueBadge';
import { DealBadge } from '@dailydotdev/shared/src/features/deals/components/DealBadge';
import { DealCaveatStrip } from '@dailydotdev/shared/src/features/deals/components/DealCaveatStrip';
import { DealCaveats } from '@dailydotdev/shared/src/features/deals/components/DealCaveats';
import { DealRedemptionNote } from '@dailydotdev/shared/src/features/deals/components/DealRedemptionNote';
import { DealVerification } from '@dailydotdev/shared/src/features/deals/components/DealVerification';
import { DealBrandLogo } from '@dailydotdev/shared/src/features/deals/components/DealBrandLogo';
import { DealCommunityProof } from '@dailydotdev/shared/src/features/deals/components/DealCommunityProof';
import { DealInviteProgress } from '@dailydotdev/shared/src/features/deals/components/DealInviteProgress';
import { DealImpactWidget } from '@dailydotdev/shared/src/features/deals/components/DealImpactWidget';
import {
  DealsFilterBar,
  DEALS_FILTER_ALL,
} from '@dailydotdev/shared/src/features/deals/components/DealsFilterBar';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
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

const FilterBarDemo = () => {
  const [filter, setFilter] = useState(DEALS_FILTER_ALL);

  return (
    <div className="flex flex-col gap-6">
      <Case label="Full width, every category" testId="filter-bar-full">
        <DealsFilterBar
          deals={mockDeals}
          activeFilter={filter}
          onFilterChange={setFilter}
          className="w-full"
        />
      </Case>
      <Case label="Narrow column, overflow scrolls" testId="filter-bar-narrow">
        <div className="w-72 rounded-12 border border-border-subtlest-tertiary p-2">
          <DealsFilterBar
            deals={mockDeals}
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </div>
      </Case>
    </div>
  );
};

export const FilterBar: Story = {
  render: () => <FilterBarDemo />,
};

export const ImpactWidget: Story = {
  render: () => (
    <Grid>
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
    </Grid>
  ),
};
