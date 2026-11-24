import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlusOptionRadio } from './PlusOptionRadio';
import type { ProductPricingPreview } from '../../graphql/paddle';

const option = {
  priceId: 'pri_annual',
  metadata: { title: 'Annual' },
  price: {
    amount: 44.99,
    formatted: '$44.99',
    monthly: { amount: 3.74, formatted: '$3.74' },
  },
  currency: { code: 'USD', symbol: '$' },
} as ProductPricingPreview;

describe('PlusOptionRadio', () => {
  it('strikes through the regular price while a discount lowers it', () => {
    render(
      <PlusOptionRadio
        checked
        shouldShowMonthlyPrice
        option={{
          ...option,
          originalPrice: {
            amount: 89.99,
            formatted: '$89.99',
            monthly: { amount: 7.49, formatted: '$7.49' },
          },
        }}
      />,
    );

    expect(screen.getByText('$7.49').tagName).toBe('DEL');
    expect(screen.getByText('$3.74')).toBeInTheDocument();
  });

  it('shows only the price when there is no discount', () => {
    render(<PlusOptionRadio checked shouldShowMonthlyPrice option={option} />);

    expect(screen.getByText('$3.74')).toBeInTheDocument();
    expect(screen.queryByText('$7.49')).not.toBeInTheDocument();
  });
});
