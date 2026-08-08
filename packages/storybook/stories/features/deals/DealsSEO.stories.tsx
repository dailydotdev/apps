import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealBreadcrumbs } from '@dailydotdev/shared/src/features/deals/components/DealBreadcrumbs';
import { DealEvidence } from '@dailydotdev/shared/src/features/deals/components/DealEvidence';
import { DealAnsweredQuestions } from '@dailydotdev/shared/src/features/deals/components/DealAnsweredQuestions';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { getDealComments } from '@dailydotdev/shared/src/features/deals/mockCommunity';
import {
  getDealBrandPath,
  getSimilarDeals,
  isLiveDeal,
} from '@dailydotdev/shared/src/features/deals/dealsFormat';
import type { Deal } from '@dailydotdev/shared/src/features/deals/types';
import {
  getDealBySlug,
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const meta: Meta<typeof DealEvidence> = {
  title: 'Features/Deals/SEO surfaces',
  component: DealEvidence,
  parameters: { layout: 'padded', controls: { disable: true } },
  decorators: [withDeals({ isLoggedOut: true })],
};

export default meta;

type Story = StoryObj<typeof DealEvidence>;

const noop = (): void => undefined;

const liveDeals = mockDeals.filter(isLiveDeal);

const requireDeal = (slug: string): Deal => {
  const deal = getDealBySlug(slug);

  if (!deal) {
    throw new Error(`The deals fixture no longer has ${slug}`);
  }

  return deal;
};

const keychron = requireDeal('keychron-q1-30-off');
const sentry = requireDeal('sentry-50-credit');

const crumbsFor = (deal: Deal) => [
  { name: 'Deals', path: '/deals' },
  { name: deal.brand.name, path: getDealBrandPath(deal.brand) },
  { name: deal.title },
];

export const Breadcrumbs: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DealBreadcrumbs crumbs={crumbsFor(keychron)} />
      <DealBreadcrumbs
        crumbs={[{ name: 'Deals', path: '/deals' }, { name: 'Hardware' }]}
      />
    </div>
  ),
};

export const Evidence: Story = {
  render: () => (
    <DealEvidence
      deal={keychron}
      comments={getDealComments(keychron.id)}
      similarDeals={getSimilarDeals(keychron, mockDeals, 4)}
      now={MOCK_NOW_MS}
    />
  ),
};

export const EvidenceOnEndedDeal: Story = {
  render: () => (
    <DealEvidence
      deal={sentry}
      comments={getDealComments(sentry.id)}
      similarDeals={getSimilarDeals(sentry, mockDeals, 4)}
      now={MOCK_NOW_MS}
    />
  ),
};

export const AnsweredQuestions: Story = {
  render: () => <DealAnsweredQuestions deal={keychron} now={MOCK_NOW_MS} />,
};

export const AnsweredQuestionsHiddenWhenSignedIn: Story = {
  decorators: [withDeals()],
  render: () => (
    <div className="flex flex-col gap-2 text-text-tertiary typo-footnote">
      Signed-in readers get the product, so the block renders nothing:
      <DealAnsweredQuestions deal={keychron} now={MOCK_NOW_MS} />
    </div>
  ),
};

export const CategoryPage: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <DealsDirectoryPage
      deals={liveDeals.filter((deal) => deal.categories.includes('Cloud'))}
      filterDeals={liveDeals}
      heading="Cloud deals and promo codes"
      intro="4 live cloud offers for developers, with the claim counts and success rates the community reported."
      resultsTitle="Cloud deals"
      withRails={false}
      now={MOCK_NOW_MS}
      onDealClick={noop}
    />
  ),
};
