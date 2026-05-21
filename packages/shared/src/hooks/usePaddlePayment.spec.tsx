import { act, renderHook, waitFor } from '@testing-library/react';
import type { PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import type { NextRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';
import { useLogContext } from '../contexts/LogContext';
import { PurchaseType } from '../graphql/paddle';
import { usePaddlePayment } from './usePaddlePayment';

const mockCheckout = {
  open: jest.fn(),
  updateItems: jest.fn(),
};
const mockLogEvent = jest.fn();
let mockEventCallback: ((event: PaddleEventData) => void) | undefined;

jest.mock('@paddle/paddle-js', () => ({
  CheckoutEventNames: {
    CHECKOUT_PAYMENT_INITIATED: 'checkout.payment.initiated',
    CHECKOUT_LOADED: 'checkout.loaded',
    CHECKOUT_PAYMENT_SELECTED: 'checkout.payment.selected',
    CHECKOUT_COMPLETED: 'checkout.completed',
    CHECKOUT_ERROR: 'checkout.error',
    CHECKOUT_PAYMENT_FAILED: 'checkout.payment.failed',
    CHECKOUT_CLOSED: 'checkout.closed',
    CHECKOUT_ITEMS_UPDATED: 'checkout.items.updated',
    CHECKOUT_DISCOUNT_APPLIED: 'checkout.discount.applied',
    CHECKOUT_DISCOUNT_REMOVED: 'checkout.discount.removed',
  },
  initializePaddle: jest.fn(({ eventCallback }) => {
    mockEventCallback = eventCallback;

    return Promise.resolve({
      Checkout: mockCheckout,
    });
  }),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));

const renderPaymentHook = async () => {
  const view = renderHook(() =>
    usePaddlePayment({
      priceType: PurchaseType.Plus,
    }),
  );

  await waitFor(() => {
    expect(view.result.current.isPaddleReady).toBe(true);
  });

  return view;
};

const appendCheckoutContainer = ({
  withIframe = false,
}: {
  withIframe?: boolean;
} = {}) => {
  const container = document.createElement('div');
  container.className = 'checkout-container';

  if (withIframe) {
    container.append(document.createElement('iframe'));
  }

  document.body.append(container);

  return container;
};

const emitCheckoutLoaded = () => {
  if (!mockEventCallback) {
    throw new Error('Paddle event callback was not registered');
  }

  act(() => {
    mockEventCallback?.({
      name: CheckoutEventNames.CHECKOUT_LOADED,
      data: {
        custom_data: {},
        items: [{ quantity: 1 }],
        payment: {
          method_details: {
            type: 'card',
          },
        },
      },
    } as unknown as PaddleEventData);
  });
};

describe('usePaddlePayment', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    mockEventCallback = undefined;
    jest.mocked(useRouter).mockReturnValue({
      query: {},
      push: jest.fn(),
    } as unknown as NextRouter);
    jest.mocked(useAuthContext).mockReturnValue({
      user: {
        id: 'user-id',
        email: 'user@daily.dev',
      },
      geo: {
        region: 'US',
      },
      trackingId: 'tracking-id',
    } as ReturnType<typeof useAuthContext>);
    jest.mocked(useLogContext).mockReturnValue({
      logEvent: mockLogEvent,
      logEventStart: jest.fn(),
      logEventEnd: jest.fn(),
      sendBeacon: jest.fn(),
    } as ReturnType<typeof useLogContext>);
  });

  it('updates checkout items when Paddle has a loaded mounted iframe', async () => {
    const { result } = await renderPaymentHook();
    appendCheckoutContainer({ withIframe: true });
    emitCheckoutLoaded();

    act(() => {
      result.current.openCheckout({ priceId: 'annual-price' });
    });

    expect(mockCheckout.updateItems).toHaveBeenCalledWith([
      { priceId: 'annual-price', quantity: 1 },
    ]);
    expect(mockCheckout.open).not.toHaveBeenCalled();
  });

  it('reopens the inline checkout when Paddle loaded state points at a remounted container', async () => {
    const { result } = await renderPaymentHook();
    appendCheckoutContainer({ withIframe: true });
    emitCheckoutLoaded();

    document.body.innerHTML = '';
    appendCheckoutContainer();

    act(() => {
      result.current.openCheckout({ priceId: 'annual-price' });
    });

    expect(mockCheckout.updateItems).not.toHaveBeenCalled();
    expect(mockCheckout.open).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ priceId: 'annual-price', quantity: 1 }],
      }),
    );
  });

  it('reopens the inline checkout when Paddle updateItems throws a missing iframe error', async () => {
    const { result } = await renderPaymentHook();
    appendCheckoutContainer({ withIframe: true });
    emitCheckoutLoaded();
    mockCheckout.updateItems.mockImplementationOnce(() => {
      throw new TypeError(
        "Cannot read properties of undefined (reading 'contentWindow')",
      );
    });

    act(() => {
      result.current.openCheckout({ priceId: 'annual-price' });
    });

    expect(mockCheckout.updateItems).toHaveBeenCalledWith([
      { priceId: 'annual-price', quantity: 1 },
    ]);
    expect(mockCheckout.open).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ priceId: 'annual-price', quantity: 1 }],
      }),
    );
  });
});
