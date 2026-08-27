import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { USER_STREAK_QUERY } from '../../graphql/users';
import {
  PURCHASE_STREAK_FREEZE_MUTATION,
  STREAK_FREEZE_PRODUCTS_QUERY,
  USER_STREAK_FREEZE_DATES_QUERY,
} from '../../graphql/streakFreeze';
import type { StreakFreezeProduct } from '../../graphql/streakFreeze';
import { useStreakFreeze } from './useStreakFreeze';
import { DayOfWeek } from '../../lib/date';

const products: StreakFreezeProduct[] = [
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

const mockFreezeDatesQuery = (dates: string[] = []) => {
  mockGraphQL({
    request: { query: USER_STREAK_FREEZE_DATES_QUERY, variables: {} },
    result: { data: { userStreakFreezeDates: dates } },
  });
};

const renderStreakFreezeHook = (client: QueryClient, balance = 1000) => {
  const auth = { user: { ...loggedUser, balance: { amount: balance } } };

  return renderHook(() => useStreakFreeze(), {
    wrapper: ({ children }) => (
      <TestBootProvider client={client} auth={auth}>
        {children}
      </TestBootProvider>
    ),
  });
};

describe('useStreakFreeze', () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient();
  });

  it('should expose freezesAvailable from the user streak', async () => {
    mockStreakQuery(3);
    mockProductsQuery();
    mockFreezeDatesQuery();

    const { result } = renderStreakFreezeHook(client);

    await waitFor(() => expect(result.current.freezesAvailable).toBe(3));
  });

  it('should fetch streak freeze products', async () => {
    mockStreakQuery();
    mockProductsQuery();
    mockFreezeDatesQuery();

    const { result } = renderStreakFreezeHook(client);

    await waitFor(() => expect(result.current.products).toHaveLength(3));
    expect(result.current.products.map((product) => product.id)).toEqual([
      'p1',
      'p3',
      'p5',
    ]);
  });

  it('should fetch consumed freeze dates', async () => {
    mockStreakQuery();
    mockProductsQuery();
    mockFreezeDatesQuery(['2024-01-01T00:00:00.000Z']);

    const { result } = renderStreakFreezeHook(client);

    await waitFor(() =>
      expect(result.current.freezeDates).toEqual(['2024-01-01T00:00:00.000Z']),
    );
  });

  it('should disable a product that would push the user over the cap of 5', async () => {
    mockStreakQuery(3);
    mockProductsQuery();
    mockFreezeDatesQuery();

    const { result } = renderStreakFreezeHook(client);

    await waitFor(() => expect(result.current.freezesAvailable).toBe(3));

    // 3 + 3 = 6 > 5
    expect(result.current.canBuyProduct(products[1])).toBeFalsy();
    // 3 + 1 = 4 <= 5
    expect(result.current.canBuyProduct(products[0])).toBeTruthy();
  });

  it('should redirect to the cores page when the balance cannot cover the product', async () => {
    mockStreakQuery();
    mockProductsQuery();
    mockFreezeDatesQuery();

    const push = jest.fn();
    jest.mocked(useRouter).mockReturnValue({
      query: {},
      push,
      pathname: '/my-feed',
    } as unknown as ReturnType<typeof useRouter>);

    const { result } = renderStreakFreezeHook(client, 0);

    await waitFor(() => expect(result.current.products).toHaveLength(3));

    await result.current.onPurchase(products[0]);

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('cores?origin=streak+freeze'),
    );
  });

  it('should purchase a product and update freezesAvailable on success', async () => {
    mockStreakQuery(1);
    mockProductsQuery();
    mockFreezeDatesQuery();

    const { result } = renderStreakFreezeHook(client, 1000);

    await waitFor(() => expect(result.current.products).toHaveLength(3));

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
              freezesAvailable: 2,
              balance: { amount: 900 },
              transactionId: 't1',
            },
          },
        };
      },
    });

    await result.current.onPurchase(products[0]);
    await waitForNock();

    expect(mutationCalled).toBeTruthy();
  });
});
