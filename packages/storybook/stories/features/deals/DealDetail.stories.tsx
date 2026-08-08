import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { ButtonVariant } from '@dailydotdev/shared/src/components/buttons/common';
import { DealDetailModal } from '@dailydotdev/shared/src/features/deals/components/DealDetailModal';
import { DealShareLanding } from '@dailydotdev/shared/src/features/deals/components/DealShareLanding';
import { DealShareBar } from '@dailydotdev/shared/src/features/deals/components/DealShareBar';
import { DealBreadcrumbs } from '@dailydotdev/shared/src/features/deals/components/DealBreadcrumbs';
import { getDealComments } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import {
  getDealBrandPath,
  getSimilarDeals,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
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
  const [isUpvoted, setIsUpvoted] = useState(false);

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
          isUpvoted={isUpvoted}
          onClose={() => setOpenDeal(null)}
          onClaim={noop}
          onUpvote={() => setIsUpvoted((current) => !current)}
          onOpenDeal={setOpenDeal}
          shareBar={<DealShareBar deal={openDeal} username="devdana" compact />}
        />
      )}
    </div>
  );
};

const PageStage = ({
  deal,
  isSignedIn = true,
}: {
  deal: Deal;
  isSignedIn?: boolean;
}) => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 tablet:px-8">
    <DealBreadcrumbs
      crumbs={[
        { name: 'Deals', path: '/deals' },
        { name: deal.brand.name, path: getDealBrandPath(deal.brand) },
        { name: deal.title },
      ]}
    />
    <DealShareLanding
      deal={deal}
      comments={getDealComments(deal.id)}
      similarDeals={getSimilarDeals(deal, mockDeals, 4)}
      isSignedIn={isSignedIn}
      now={MOCK_NOW_MS}
      onClaim={noop}
      onJoin={noop}
      shareBar={<DealShareBar deal={deal} username="devdana" />}
    />
  </div>
);

export const CodeDeal: Story = {
  render: () => <DetailStage deal={findDeal('keychron-q1-30-off')} />,
};

export const CreditDeal: Story = {
  render: () => <DetailStage deal={findDeal('digitalocean-200-credit')} />,
};

export const LockedByInvites: Story = {
  render: () => <DetailStage deal={findDeal('linear-3-months-free')} />,
};

export const LockedByCores: Story = {
  render: () => <DetailStage deal={findDeal('cursor-pro-month-for-cores')} />,
};

/**
 * Both routes on one offer. Cores takes the primary button because it is the
 * instant path, and the invite progress stays next to the invite button.
 */
export const LockedByCoresOrInvites: Story = {
  render: () => (
    <DetailStage deal={findDeal('raycast-pro-year-members-only')} />
  ),
};

/**
 * Two clocks. The deadline to start is not the end of the offer, so the claim
 * area prints both instead of collapsing them into one countdown.
 */
export const ClaimByDeadline: Story = {
  render: () => <DetailStage deal={findDeal('cursor-20-credit')} />,
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
 * Where the elements the row and the card gave up now live: the description,
 * the boost meter, the redemption note, the full caveat list and the upvote.
 */
export const BoostedDeal: Story = {
  render: () => <DetailStage deal={findDeal('warp-pro-community-boost')} />,
};

/**
 * The photo sits in `What you get`, below the claim area, so the primary button
 * is the first thing under the title on every offer that carries a hero.
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
 * The ranked caveats ride in the claim area directly above the button, so the
 * restriction interrupts before the click. Their full sentences stay in
 * `Worth knowing before you claim` further down.
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

export const DealPage: Story = {
  render: () => <PageStage deal={findDeal('keychron-q1-30-off')} />,
};

export const DealPageLoggedOut: Story = {
  decorators: [withDeals({ isLoggedOut: true })],
  render: () => (
    <PageStage deal={findDeal('keychron-q1-30-off')} isSignedIn={false} />
  ),
};

const parityDeal = findDeal('keychron-q1-30-off');

/**
 * The same offer in both presentations. A transformed wrapper traps the
 * dialog's `position: fixed` inside the left column so the real modal shell
 * renders next to the real page.
 */
export const ModalAndPageParity: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
      <div className="relative h-[50rem] transform-gpu overflow-hidden rounded-16 bg-background-subtle">
        <DealDetailModal
          deal={parityDeal}
          now={MOCK_NOW_MS}
          onClose={noop}
          onClaim={noop}
          onUpvote={noop}
          shareBar={
            <DealShareBar deal={parityDeal} username="devdana" compact />
          }
        />
      </div>
      <div className="h-[50rem] overflow-y-auto rounded-16 border border-border-subtlest-tertiary">
        <PageStage deal={parityDeal} />
      </div>
    </div>
  ),
};
