import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import ReactModal from 'react-modal';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../../__tests__/helpers/utilities';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { USER_STREAK_QUERY } from '../../../graphql/users';
import {
  PURCHASE_STREAK_FREEZE_MUTATION,
  STREAK_FREEZE_PRODUCTS_QUERY,
  USER_STREAK_FREEZE_DATES_QUERY,
} from '../../../graphql/streakFreeze';
import { DayOfWeek } from '../../../lib/date';
import { StreakFreezePurchaseModal } from './StreakFreezePurchaseModal';

ReactModal.setAppElement('body');

const products = [
  {
    id: 'p1',
    name: '1 pack',
    value: 100,
    image: 'img1',
    flags: { quantity: 1 },
  },
  {
    id: 'p3',
    name: '3 pack',
    value: 250,
    image: 'img3',
    flags: { quantity: 3 },
  },
  {
    id: 'p5',
    name: '5 pack',
    value: 400,
    image: 'img5',
    flags: { quantity: 5 },
  },
];

const mockStreakQuery = (freezesAvailable = 0) => {
  mockGraphQL({
    request: { query: USER_STREAK_QUERY },
    result: {
      data: {
        userStreak: {
          max: 5,
          total: 5,
          current: 5,
          weekStart: DayOfWeek.Monday,
          lastViewAt: new Date().toISOString(),
          freezesAvailable,
        },
      },
    },
  });
};

const mockProductsQuery = () => {
  mockGraphQL({
    request: { query: STREAK_FREEZE_PRODUCTS_QUERY },
    result: { data: { streakFreezeProducts: products } },
  });
};

const mockFreezeDatesQuery = () => {
  mockGraphQL({
    request: { query: USER_STREAK_FREEZE_DATES_QUERY, variables: {} },
    result: { data: { userStreakFreezeDates: [] } },
  });
};

const renderComponent = ({
  balance = 1000,
  freezesAvailable = 3,
}: { balance?: number; freezesAvailable?: number } = {}) => {
  const client = new QueryClient();
  mockStreakQuery(freezesAvailable);
  mockProductsQuery();
  mockFreezeDatesQuery();

  return render(
    <TestBootProvider
      client={client}
      auth={{ user: { ...loggedUser, balance: { amount: balance } } }}
    >
      <StreakFreezePurchaseModal isOpen onRequestClose={jest.fn()} />
    </TestBootProvider>,
  );
};

describe('StreakFreezePurchaseModal', () => {
  it('should render the packs once loaded', async () => {
    renderComponent();

    await waitForNock();

    expect(
      await screen.findByTestId('streak-freeze-pack-p1'),
    ).toHaveTextContent('1 freeze');
    expect(screen.getByTestId('streak-freeze-pack-p3')).toHaveTextContent(
      '3 freezes',
    );
    expect(screen.getByTestId('streak-freeze-pack-p5')).toHaveTextContent(
      '5 freezes',
    );
  });

  it('should disable packs that would push the user over the cap of 5', async () => {
    renderComponent({ freezesAvailable: 3 });

    await waitForNock();

    // 3 available + 1 = 4 (ok), + 3 = 6 (disabled), + 5 = 8 (disabled)
    expect(await screen.findByTestId('streak-freeze-pack-p1')).toBeEnabled();
    expect(screen.getByTestId('streak-freeze-pack-p3')).toBeDisabled();
    expect(screen.getByTestId('streak-freeze-pack-p5')).toBeDisabled();
  });

  it('should show "Buy Cores" when the balance cannot cover the selected pack', async () => {
    renderComponent({ balance: 0, freezesAvailable: 0 });

    await waitForNock();

    await waitFor(() =>
      expect(
        screen.getByTestId('streak-freeze-purchase-button'),
      ).toHaveTextContent('Buy Cores100'),
    );
  });

  it('should purchase the selected pack', async () => {
    renderComponent({ balance: 1000, freezesAvailable: 0 });

    await waitForNock();

    let mutationCalled = false;
    mockGraphQL({
      request: {
        query: PURCHASE_STREAK_FREEZE_MUTATION,
        variables: { productId: 'p1' },
      },
      result: () => {
        mutationCalled = true;

        return {
          data: {
            purchaseStreakFreeze: {
              freezesAvailable: 1,
              balance: { amount: 900 },
              transactionId: 't1',
            },
          },
        };
      },
    });

    const button = await screen.findByTestId('streak-freeze-purchase-button');
    await waitFor(() =>
      expect(button).toHaveTextContent('Get 1 freeze for 100'),
    );
    fireEvent.click(button);

    await waitFor(() => expect(mutationCalled).toBeTruthy());
  });
});
