import { act, renderHook } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Paddle, PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames, initializePaddle } from '@paddle/paddle-js';
import { usePaddlePayment } from './usePaddlePayment';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { PurchaseType } from '../graphql/paddle';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@paddle/paddle-js', () => ({
  CheckoutEventNames: {
    CHECKOUT_LOADED: 'checkout.loaded',
    CHECKOUT_CLOSED: 'checkout.closed',
    CHECKOUT_COMPLETED: 'checkout.completed',
    CHECKOUT_DISCOUNT_APPLIED: 'checkout.discount.applied',
    CHECKOUT_DISCOUNT_REMOVED: 'checkout.discount.removed',
    CHECKOUT_ERROR: 'checkout.error',
    CHECKOUT_ITEMS_UPDATED: 'checkout.items.updated',
    CHECKOUT_PAYMENT_FAILED: 'checkout.payment.failed',
    CHECKOUT_PAYMENT_INITIATED: 'checkout.payment.initiated',
    CHECKOUT_PAYMENT_SELECTED: 'checkout.payment.selected',
  },
  initializePaddle: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

describe('usePaddlePayment', () => {
  let mockRouter: Partial<NextRouter>;
  let routeChangeStart: ((url: string) => void) | undefined;
  let eventCallback: ((event: PaddleEventData) => void) | undefined;
  let close: jest.Mock;
  let open: jest.Mock;

  beforeEach(() => {
    close = jest.fn();
    open = jest.fn();
    routeChangeStart = undefined;
    eventCallback = undefined;

    mockRouter = {
      query: {},
      push: jest.fn(),
      events: {
        emit: jest.fn(),
        on: jest.fn((event: string, handler: (url: string) => void) => {
          if (event === 'routeChangeStart') {
            routeChangeStart = handler;
          }
        }),
        off: jest.fn(),
      },
    };

    mocked(useRouter).mockReturnValue(mockRouter as NextRouter);
    mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
      },
      geo: { region: 'US' },
      trackingId: 'tracking-1',
    } as ReturnType<typeof useAuthContext>);
    mocked(useLogContext).mockReturnValue({
      logEvent: jest.fn(),
      logEventEnd: jest.fn(),
      logEventStart: jest.fn(),
      sendBeacon: jest.fn(),
    } as ReturnType<typeof useLogContext>);
    mocked(initializePaddle).mockImplementation(async (config) => {
      eventCallback = config.eventCallback;

      return {
        Checkout: {
          close,
          open,
          updateItems: jest.fn(),
        },
      } as unknown as Paddle;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('closes an open checkout on route changes', async () => {
    const { result } = renderHook(() =>
      usePaddlePayment({ priceType: PurchaseType.Plus }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.openCheckout({ priceId: 'pri_123' });
    });

    act(() => {
      eventCallback?.({
        name: CheckoutEventNames.CHECKOUT_LOADED,
        data: {
          items: [{ billing_cycle: { interval: 'month' } }],
          payment: { method_details: { type: 'card' } },
        },
      } as PaddleEventData);
    });

    act(() => {
      routeChangeStart?.('/plus/success');
    });

    expect(close).toHaveBeenCalledTimes(1);
  });

  it('closes an open checkout when the hook unmounts', async () => {
    const { result, unmount } = renderHook(() =>
      usePaddlePayment({ priceType: PurchaseType.Plus }),
    );

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.openCheckout({ priceId: 'pri_123' });
    });

    act(() => {
      eventCallback?.({
        name: CheckoutEventNames.CHECKOUT_LOADED,
        data: {
          items: [{ billing_cycle: { interval: 'month' } }],
          payment: { method_details: { type: 'card' } },
        },
      } as PaddleEventData);
    });

    unmount();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
