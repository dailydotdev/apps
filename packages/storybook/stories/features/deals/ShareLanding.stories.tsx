import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealShareLanding } from '@dailydotdev/shared/src/features/deals/components/DealShareLanding';
import { getDealComments } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import { getSimilarDeals } from '@dailydotdev/shared/src/features/deals/dealsFormat';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { getDealBySlug, mockDeals, withDeals } from './deals.mocks';

const meta: Meta<typeof DealShareLanding> = {
  title: 'Features/Deals/Share landing',
  component: DealShareLanding,
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  decorators: [withDeals({ isLoggedOut: true })],
};

export default meta;

type Story = StoryObj<typeof DealShareLanding>;

const sharer = {
  name: 'Tsahi',
  avatar:
    'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
};

const liveDeal = getDealBySlug('cursor-20-credit') as Deal;
const expiredDeal = getDealBySlug('sentry-50-credit') as Deal;

const noop = (): void => undefined;

const Stage = ({
  deal,
  isSignedIn = false,
  withSharer = false,
}: {
  deal: Deal;
  isSignedIn?: boolean;
  withSharer?: boolean;
}) => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 tablet:px-8">
    <DealShareLanding
      deal={deal}
      sharerName={withSharer ? sharer.name : undefined}
      sharerAvatarUrl={withSharer ? sharer.avatar : undefined}
      comments={getDealComments(deal.id)}
      similarDeals={getSimilarDeals(deal, mockDeals, 4)}
      isSignedIn={isSignedIn}
      onJoin={noop}
      onClaim={noop}
    />
  </div>
);

export const LoggedOutVisitor: Story = {
  render: () => <Stage deal={liveDeal} withSharer />,
};

const productDeal = getDealBySlug('keychron-q1-30-off') as Deal;

export const ProductPhotoHero: Story = {
  render: () => <Stage deal={productDeal} withSharer />,
};

const coresDeal = getDealBySlug('cursor-pro-month-for-cores') as Deal;
const bothRoutesDeal = getDealBySlug('raycast-pro-year-members-only') as Deal;

/**
 * The unlock cost and both unlock routes are part of the page body, not a
 * client only overlay, so a crawler reading the raw HTML sees the price.
 */
export const LockedByCores: Story = {
  render: () => <Stage deal={coresDeal} />,
};

export const LockedByCoresOrInvites: Story = {
  decorators: [withDeals()],
  render: () => <Stage deal={bothRoutesDeal} isSignedIn />,
};

/**
 * A share link that outlived its offer keeps the URL and says so, and the live
 * alternatives move directly under the claim area instead of the page footer.
 */
export const ExpiredDeal: Story = {
  render: () => <Stage deal={expiredDeal} withSharer />,
};
