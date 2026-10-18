import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { CoresRole } from '../../lib/user';
import { CoresBalanceNote } from './CoresBalanceNote';

const renderComponent = ({
  balance = 1250,
  price,
  coresRole = CoresRole.User,
}: {
  balance?: number;
  price?: number;
  coresRole?: CoresRole;
} = {}) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{
        user: { ...loggedUser, coresRole, balance: { amount: balance } },
      }}
    >
      <CoresBalanceNote price={price} />
    </TestBootProvider>,
  );

describe('CoresBalanceNote', () => {
  it('should render the current balance', () => {
    renderComponent({ balance: 1250 });

    expect(screen.getByTestId('cores-balance-note')).toHaveTextContent(
      'Current balance:1,250',
    );
  });

  it('should not render the shortfall when the balance covers the price', () => {
    renderComponent({ balance: 1250, price: 400 });

    expect(screen.getByTestId('cores-balance-note')).not.toHaveTextContent(
      'more needed',
    );
  });

  it('should render the shortfall when the price exceeds the balance', () => {
    renderComponent({ balance: 120, price: 400 });

    expect(screen.getByTestId('cores-balance-note')).toHaveTextContent(
      '280 more needed',
    );
  });

  it('should not render without access to Cores', () => {
    renderComponent({ coresRole: CoresRole.None });

    expect(screen.queryByTestId('cores-balance-note')).not.toBeInTheDocument();
  });
});
