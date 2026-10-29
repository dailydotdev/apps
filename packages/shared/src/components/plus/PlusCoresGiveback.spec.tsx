import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { PlusCoresGiveback } from './PlusCoresGiveback';
import type { ProductPricingPreview } from '../../graphql/paddle';
import { PlusPriceType, PlusPriceTypeAppsId } from '../../lib/featureValues';
import type { LoggedUser } from '../../lib/user';
import { CoresRole } from '../../lib/user';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';

const yearlyOption: ProductPricingPreview = {
  priceId: 'pri_yearly',
  price: { amount: 89.99, formatted: '$89.99' },
  currency: { code: 'USD', symbol: '$' },
  duration: PlusPriceType.Yearly,
  metadata: {
    appsId: PlusPriceTypeAppsId.Annual,
    title: 'Annual',
    idMap: { paddle: 'pri_yearly', ios: 'ios_yearly' },
  },
  coresGiveback: 4499,
};

const renderComponent = (
  option: ProductPricingPreview,
  user: LoggedUser = { ...loggedUser, coresRole: CoresRole.User },
) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user }}>
      <PlusCoresGiveback option={option} />
    </TestBootProvider>,
  );

describe('PlusCoresGiveback', () => {
  it('shows the Cores given back for the selected plan', () => {
    renderComponent(yearlyOption);

    expect(screen.getByText('4,499 Cores')).toBeInTheDocument();
    expect(screen.getByText(/back every year/)).toBeInTheDocument();
  });

  it('hides when the user has no access to Cores', () => {
    renderComponent(yearlyOption, {
      ...loggedUser,
      coresRole: CoresRole.None,
    });

    expect(screen.queryByText(/Cores/)).not.toBeInTheDocument();
  });

  it('hides when the price has no Cores giveback', () => {
    renderComponent({ ...yearlyOption, coresGiveback: null });

    expect(screen.queryByText(/Cores/)).not.toBeInTheDocument();
  });
});
