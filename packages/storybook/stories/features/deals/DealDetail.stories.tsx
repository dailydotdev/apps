import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { DealDetailModal } from '@dailydotdev/shared/src/features/deals/components/DealDetailModal';
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
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const meta: Meta<typeof DealDetailModal> = {
  title: 'Features/Deals/Offer detail',
  component: DealDetailModal,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof DealDetailModal>;

const noop = (): void => undefined;

const findDeal = (slug: string): Deal => {
  const deal = getDealBySlug(slug);

  if (!deal) {
    throw new Error(`Missing mock deal for slug ${slug}`);
  }

  return deal;
};

const DetailStage = ({ deal }: { deal: Deal }) => {
  const [openDeal, setOpenDeal] = useState<Deal | null>(deal);

  return (
    <div className="flex min-h-[45rem] items-center justify-center bg-background-subtle">
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        onClick={() => setOpenDeal(deal)}
      >
        Open the offer
      </Button>
      {openDeal && (
        <DealDetailModal
          deal={openDeal}
          now={MOCK_NOW_MS}
          onClose={() => setOpenDeal(null)}
          onClaim={noop}
          onOpenDeal={setOpenDeal}
        />
      )}
    </div>
  );
};

export const CodeDeal: Story = {
  render: () => <DetailStage deal={findDeal('keychron-q1-30-off')} />,
};

export const CreditDeal: Story = {
  render: () => <DetailStage deal={findDeal('digitalocean-200-credit')} />,
};

export const LockedExclusive: Story = {
  render: () => (
    <DetailStage
      deal={{
        ...findDeal('vercel-pro-members-only'),
        state: DealState.Locked,
        lock: { invitesRequired: 2, invitesDone: 1 },
      }}
    />
  ),
};

export const ExpiringGiftCard: Story = {
  render: () => (
    <DetailStage
      deal={{
        ...findDeal('amazon-10-gift-card'),
        type: DealType.GiftCard,
        state: DealState.Expiring,
        expiresAt: new Date(MOCK_NOW_MS + 9 * 60 * 60 * 1000).toISOString(),
      }}
    />
  ),
};

export const Expired: Story = {
  render: () => <DetailStage deal={findDeal('sentry-50-credit')} />,
};

export const Promoted: Story = {
  render: () => (
    <DetailStage deal={mockDeals.filter((deal) => deal.isPromoted)[0]} />
  ),
};

/**
 * The hero is capped so the claim CTA still lands above the fold inside the
 * 44rem dialog. Check that the CTA is visible without scrolling on a laptop.
 */
export const ProductPhotoHero: Story = {
  render: () => <DetailStage deal={findDeal('logitech-mx-master-20-off')} />,
};

export const GiftCardArtworkHero: Story = {
  render: () => <DetailStage deal={findDeal('amazon-10-gift-card')} />,
};

export const BrandLedNoHero: Story = {
  render: () => <DetailStage deal={findDeal('cursor-20-credit')} />,
};

const deadHeroMedia: DealMedia = {
  kind: DealMediaKind.Product,
  imageUrl: 'https://upload.wikimedia.org/this-file-does-not-exist.jpg',
  alt: 'A black Logitech MX Master wireless mouse photographed from above',
  isRepresentative: true,
};

export const BrokenHeroImage: Story = {
  render: () => (
    <DetailStage
      deal={{ ...findDeal('logitech-mx-master-20-off'), media: deadHeroMedia }}
    />
  ),
};

/**
 * `Worth knowing before you claim` sits between the reasoning and the claim
 * control, so the restriction interrupts before the click rather than after.
 */
export const CaveatsBeforeClaim: Story = {
  render: () => (
    <DetailStage deal={findDeal('frontend-masters-3-months-free')} />
  ),
};

export const NoCaveats: Story = {
  render: () => (
    <DetailStage deal={{ ...findDeal('cursor-20-credit'), caveats: [] }} />
  ),
};
