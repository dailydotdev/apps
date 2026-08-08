import type { ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DealsAdRow } from '@dailydotdev/shared/src/features/deals/components/DealsAdRow';
import { DealsAdPanel } from '@dailydotdev/shared/src/features/deals/components/DealsAdPanel';
import { DealListCard } from '@dailydotdev/shared/src/features/deals/components/DealListCard';
import { DealsDirectoryPage } from '@dailydotdev/shared/src/features/deals/components/DealsDirectoryPage';
import { DealShareLanding } from '@dailydotdev/shared/src/features/deals/components/DealShareLanding';
import {
  dealsListAd,
  dealsPageAd,
} from '@dailydotdev/shared/src/features/deals/mockDealsAds';
import { isLiveDeal } from '@dailydotdev/shared/src/features/deals/dealsFormat';
import {
  getDealBySlug,
  mockDeals,
  MOCK_NOW_MS,
  withDeals,
} from './deals.mocks';

const meta: Meta<typeof DealsAdRow> = {
  title: 'Features/Deals/Ads',
  component: DealsAdRow,
  parameters: { layout: 'padded', controls: { disable: true } },
  decorators: [withDeals()],
};

export default meta;

type Story = StoryObj<typeof DealsAdRow>;

const noop = (): void => undefined;

const liveDeals = mockDeals.filter(isLiveDeal);

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <span className="font-bold uppercase tracking-wider text-text-tertiary typo-caption2">
    {children}
  </span>
);

/**
 * The paid row on its own. It borrows the deal row's geometry, and nothing
 * else: no value badge, no community proof, no pick label, and the promoted
 * disclosure prints where a deal prints its type.
 */
export const AdRow: Story = {
  render: () => (
    <ul className="flex flex-col">
      <DealsAdRow ad={dealsListAd} />
    </ul>
  ),
};

/**
 * The row in its habitat. Scan the left edge: every other line is an offer we
 * stand behind, and the seventh is labelled inventory. Check both themes.
 */
export const AdInList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <SectionLabel>All deals, with the one paid row</SectionLabel>
      <ul className="flex flex-col">
        {liveDeals.slice(0, 6).map((deal) => (
          <DealListCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
        ))}
        <DealsAdRow ad={dealsListAd} />
        {liveDeals.slice(6, 10).map((deal) => (
          <DealListCard key={deal.id} deal={deal} now={MOCK_NOW_MS} />
        ))}
      </ul>
    </div>
  ),
};

/** The whole directory, where the slot lands at its real index. */
export const AdInDirectory: Story = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => <DealsDirectoryPage deals={mockDeals} onDealClick={noop} />,
};

/** The deal page's single slot, on its own. */
export const AdPanel: Story = {
  render: () => (
    <div className="max-w-3xl">
      <DealsAdPanel ad={dealsPageAd} />
    </div>
  ),
};

const pageDeal = getDealBySlug('cursor-20-credit');

if (!pageDeal) {
  throw new Error('Missing mock deal for slug cursor-20-credit');
}

/**
 * The deal page carrying it. The panel sits below the verification, the
 * reports and the provenance links, so nothing paid ever comes between the
 * offer and what a reader has to watch out for.
 */
export const AdOnDealPage: Story = {
  render: () => (
    <div className="mx-auto max-w-3xl">
      <DealShareLanding
        deal={pageDeal}
        isSignedIn
        now={MOCK_NOW_MS}
        onClaim={noop}
      />
    </div>
  ),
};
