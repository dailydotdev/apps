import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealCard } from '@dailydotdev/shared/src/features/deals/components/DealCard';
import { DealCodeReveal } from '@dailydotdev/shared/src/features/deals/components/DealCodeReveal';
import type {
  Deal,
  DealMedia,
} from '@dailydotdev/shared/src/features/deals/types';
import {
  DealMediaKind,
  DealState,
  DealType,
} from '@dailydotdev/shared/src/features/deals/types';
import {
  getDealBySlug,
  getDealsByState,
  getDealsByType,
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const getAvailableDealOfType = (type: DealType): Deal => {
  const deals = getDealsByType(type);

  return deals.find(({ state }) => state === DealState.Available) ?? deals[0];
};

const findDeal = (slug: string): Deal => {
  const deal = getDealBySlug(slug);

  if (!deal) {
    throw new Error(`Missing mock deal for slug ${slug}`);
  }

  return deal;
};

const DEAD_IMAGE_URL =
  'https://upload.wikimedia.org/this-file-does-not-exist.jpg';

const meta: Meta<typeof DealCard> = {
  title: 'Features/Deals/Deal card',
  component: DealCard,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof DealCard>;

const noop = (): void => undefined;

const typeLabels: { label: string; type: DealType }[] = [
  { label: 'Promo code', type: DealType.PromoCode },
  { label: 'Credit', type: DealType.Credit },
  { label: 'Affiliate', type: DealType.Affiliate },
  { label: 'Free months', type: DealType.FreeMonths },
  { label: 'Gift card', type: DealType.GiftCard },
  { label: 'Exclusive', type: DealType.Exclusive },
];

const stateLabels: { label: string; deal: Deal }[] = [
  { label: 'Available', deal: getDealsByState(DealState.Available)[0] },
  { label: 'Claimed', deal: getDealsByState(DealState.Claimed)[0] },
  { label: 'Expiring', deal: getDealsByState(DealState.Expiring)[0] },
  { label: 'Expired', deal: getDealsByState(DealState.Expired)[0] },
  { label: 'Locked', deal: getDealsByState(DealState.Locked)[0] },
  { label: 'Sold out', deal: getDealsByState(DealState.SoldOut)[0] },
  { label: 'Promoted', deal: mockDeals.filter((deal) => deal.isPromoted)[0] },
];

const LabelledGrid = ({
  items,
}: {
  items: { label: string; testId: string; deal: Deal }[];
}) => (
  <div className="grid gap-6 tablet:grid-cols-2 laptop:grid-cols-3">
    {items.map(({ label, testId, deal }) => (
      <div key={testId} data-testid={testId} className="flex flex-col gap-2">
        <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
          {label}
        </span>
        <DealCard
          deal={deal}
          now={MOCK_NOW_MS}
          onClaim={noop}
          onShare={noop}
          onUpvote={noop}
        />
      </div>
    ))}
  </div>
);

export const AllTypes: Story = {
  render: () => (
    <LabelledGrid
      items={typeLabels.map(({ label, type }) => ({
        label,
        testId: `deal-type-${type}`,
        deal: getAvailableDealOfType(type),
      }))}
    />
  ),
};

export const AllStates: Story = {
  render: () => (
    <LabelledGrid
      items={stateLabels.map(({ label, deal }) => ({
        label,
        testId: `deal-state-${deal.isPromoted ? 'promoted' : deal.state}`,
        deal,
      }))}
    />
  ),
};

const communityPickDeal = mockDeals.filter((deal) => deal.isCommunityPick)[0];

export const CommunityPick: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Community pick',
          testId: 'deal-community-pick',
          deal: communityPickDeal,
        },
        {
          label: 'Same deal, no pick badge',
          testId: 'deal-community-pick-control',
          deal: { ...communityPickDeal, isCommunityPick: false },
        },
      ]}
    />
  ),
};

const ClaimFlowDemo = () => {
  const baseDeal = getAvailableDealOfType(DealType.PromoCode);
  const [isClaimed, setIsClaimed] = useState(false);
  const [upvotes, setUpvotes] = useState(baseDeal.community.upvotes);
  const [feedback, setFeedback] = useState<string | null>(null);

  const deal: Deal = {
    ...baseDeal,
    state: isClaimed ? DealState.Claimed : baseDeal.state,
    community: { ...baseDeal.community, upvotes },
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <DealCard
        deal={deal}
        now={MOCK_NOW_MS}
        onClaim={() => setIsClaimed(true)}
        onShare={noop}
        onUpvote={() => setUpvotes((current) => current + 1)}
      />
      {isClaimed && (
        <DealCodeReveal
          code={deal.code ?? 'DAILYDEV'}
          onFeedback={(worked) =>
            setFeedback(worked ? 'reported working' : 'reported dead')
          }
        />
      )}
      {feedback && (
        <span className="text-text-tertiary typo-caption1">
          Community signal: {feedback}
        </span>
      )}
    </div>
  );
};

export const ClaimFlow: Story = {
  render: () => <ClaimFlowDemo />,
};

const productDeal = findDeal('keychron-q1-30-off');
const artworkDeal = findDeal('amazon-10-gift-card');
const brandDeal = findDeal('cursor-20-credit');

export const CoverTreatments: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Product photo, cover slot',
          testId: 'deal-cover-product',
          deal: productDeal,
        },
        {
          label: 'Brand led, logo chip only',
          testId: 'deal-cover-brand',
          deal: brandDeal,
        },
        {
          label: 'Gift card artwork, tinted and contained',
          testId: 'deal-cover-artwork',
          deal: artworkDeal,
        },
      ]}
    />
  ),
};

const deadCoverMedia: DealMedia = {
  kind: DealMediaKind.Product,
  imageUrl: DEAD_IMAGE_URL,
  alt: 'A Keychron Q series aluminium mechanical keyboard',
  isRepresentative: true,
};

export const BrokenCoverImage: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Cover loads',
          testId: 'deal-cover-healthy',
          deal: productDeal,
        },
        {
          label: 'Cover 404s, brand logo takes the slot',
          testId: 'deal-cover-dead-photo',
          deal: { ...productDeal, media: deadCoverMedia },
        },
        {
          label: 'Cover 404s and no icon resolves, monogram wins',
          testId: 'deal-cover-monogram',
          deal: {
            ...productDeal,
            brand: { ...productDeal.brand, logoUrl: null, domain: '' },
            media: deadCoverMedia,
          },
        },
      ]}
    />
  ),
};

const stackedDeal = findDeal('figma-professional-35-off');

/**
 * Before the precedence rule this card rendered a type pill, a community pick
 * chip, a promoted caption, a countdown and a pool counter at the same time.
 * It now renders one label, and everything demoted sits in the metadata line.
 */
export const BadgePrecedence: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Would have shown five, shows one',
          testId: 'deal-badge-precedence',
          deal: {
            ...stackedDeal,
            isCommunityPick: true,
            isPromoted: true,
            pool: { total: 40, left: 6 },
          },
        },
        {
          label: 'Community pick only',
          testId: 'deal-badge-community-pick',
          deal: {
            ...stackedDeal,
            state: DealState.Available,
            isCommunityPick: true,
          },
        },
        {
          label: 'No badge earned',
          testId: 'deal-badge-none',
          deal: { ...stackedDeal, state: DealState.Available },
        },
      ]}
    />
  ),
};

/**
 * The caveat strip sits directly above the CTA, capped at two, and never
 * renders an empty row.
 */
export const Caveats: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Three caveats, one hidden',
          testId: 'deal-caveats-truncated',
          deal: findDeal('frontend-masters-3-months-free'),
        },
        {
          label: 'Two caveats',
          testId: 'deal-caveats-two',
          deal: findDeal('digitalocean-200-credit'),
        },
        {
          label: 'One caveat',
          testId: 'deal-caveats-one',
          deal: findDeal('udemy-developer-bundle'),
        },
      ]}
    />
  ),
};

export const PromotedAndBoost: Story = {
  render: () => (
    <LabelledGrid
      items={[
        {
          label: 'Promoted placement',
          testId: 'deal-promoted',
          deal: mockDeals.filter((deal) => deal.isPromoted)[0],
        },
        {
          label: 'Community boost meter',
          testId: 'deal-boost',
          deal: mockDeals.filter((deal) => !!deal.boost)[0],
        },
      ]}
    />
  ),
};
