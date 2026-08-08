import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealShareLanding } from '@dailydotdev/shared/src/features/deals/components/DealShareLanding';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import { DealState } from '@dailydotdev/shared/src/features/deals/types';
import { getDealBySlug, getDealsByState, withDeals } from './deals.mocks';

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
const similarDeals = getDealsByState(DealState.Available).slice(0, 3);

const noop = (): void => undefined;

export const LoggedOutVisitor: Story = {
  render: () => (
    <DealShareLanding
      deal={liveDeal}
      sharerName={sharer.name}
      sharerAvatarUrl={sharer.avatar}
      onJoin={noop}
    />
  ),
};

const productDeal = getDealBySlug('keychron-q1-30-off') as Deal;

export const ProductPhotoHero: Story = {
  render: () => (
    <DealShareLanding
      deal={productDeal}
      sharerName={sharer.name}
      sharerAvatarUrl={sharer.avatar}
      onJoin={noop}
    />
  ),
};

export const ExpiredDeal: Story = {
  render: () => (
    <DealShareLanding
      deal={expiredDeal}
      sharerName={sharer.name}
      sharerAvatarUrl={sharer.avatar}
      similarDeals={similarDeals}
      onJoin={noop}
    />
  ),
};
