import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Product } from '../../../graphql/njord';
import { getProductsQueryOptions } from '../../../graphql/njord';
import { CoresRole } from '../../../lib/user';
import type { LoggedUser } from '../../../lib/user';
import GiveAwardModal from './GiveAwardModal';

jest.mock('./BuyCoresModal', () => ({
  BuyCoresModal: ({ onCompletion }: { onCompletion: () => void }) => (
    <button type="button" onClick={onCompletion}>
      Got it
    </button>
  ),
}));

const coffee: Product = {
  id: 'coffee',
  type: 'award',
  name: 'Coffee',
  image: 'https://daily.dev/coffee.png',
  value: 50,
};

const withBalance = (amount: number): LoggedUser => ({
  ...loggedUser,
  coresRole: CoresRole.User,
  balance: { amount },
});

const client = new QueryClient();
client.setQueryData(getProductsQueryOptions().queryKey, {
  edges: [{ node: coffee }],
});

const modal = (
  <GiveAwardModal
    isOpen
    type="USER"
    entity={{
      id: 'u2',
      receiver: { id: 'u2', name: 'Sam', username: 'sam', image: '' },
    }}
    onRequestClose={jest.fn()}
    ariaHideApp={false}
  />
);

const renderWithBalance = (amount: number) => (
  <TestBootProvider client={client} auth={{ user: withBalance(amount) }}>
    {modal}
  </TestBootProvider>
);

describe('GiveAwardModal buying Cores for an award', () => {
  it('should return to the note with the picked award once the Cores cover it', () => {
    const { rerender } = render(renderWithBalance(20));

    fireEvent.click(screen.getByAltText('Coffee'));
    fireEvent.click(screen.getByRole('button', { name: /Buy Cores/ }));

    rerender(renderWithBalance(120));
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(
      screen.getByPlaceholderText(/Share a few words about why/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Send Award for/ }),
    ).toBeInTheDocument();
  });

  it('should keep the award picked when the Cores have not landed yet', () => {
    render(renderWithBalance(20));

    fireEvent.click(screen.getByAltText('Coffee'));
    fireEvent.click(screen.getByRole('button', { name: /Buy Cores/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(
      screen.getByRole('button', { name: /Buy Cores/ }),
    ).toBeInTheDocument();
  });
});
