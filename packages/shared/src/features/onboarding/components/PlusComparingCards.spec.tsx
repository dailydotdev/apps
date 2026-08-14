import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlusComparingCards } from './PlusComparingCards';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { PlusPriceType } from '../../../lib/featureValues';

jest.mock('../../../hooks', () => ({
  usePlusSubscription: () => ({
    isPlus: false,
    logSubscriptionEvent: jest.fn(),
  }),
}));

// A sale is running app-wide for this spec: promotions must still stay out of
// onboarding, where pricing is owned by the funnel.
jest.mock('../../../hooks/usePlusSale', () => ({
  usePlusSale: () => ({
    isActive: true,
    label: '50% off',
    code: 'SUMMER50',
    headline: 'Summer sale: 50% off Plus',
  }),
}));

const productOption = {
  priceId: 'pri_1',
  price: {
    amount: 10,
    formatted: '$10',
    monthly: { amount: 5, formatted: '$5' },
  },
  currency: { code: 'USD', symbol: '$' },
  duration: PlusPriceType.Yearly,
  metadata: { title: 'Annual' },
} as ProductPricingPreview;

describe('PlusComparingCards', () => {
  it('never shows the Plus sale promotion inside onboarding', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PlusComparingCards
          onClickNext={jest.fn()}
          onClickPlus={jest.fn()}
          productOption={productOption}
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Get started')).toBeInTheDocument();
    expect(screen.queryByText('50% off')).not.toBeInTheDocument();
    expect(screen.queryByText('SUMMER50')).not.toBeInTheDocument();
  });
});
