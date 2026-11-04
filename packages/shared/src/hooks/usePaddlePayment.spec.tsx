import type { ReactNode } from 'react';
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import type { PaddleEventData } from '@paddle/paddle-js';
import { CheckoutEventNames } from '@paddle/paddle-js';
import { usePaddlePayment } from './usePaddlePayment';
import { getLogContextStatic } from '../contexts/LogContext';
import type { AuthContextData } from '../contexts/AuthContext';
import AuthContext from '../contexts/AuthContext';
import type { LogContextData } from './log/useLogContextData';
import { PurchaseType } from '../graphql/paddle';
import { LogEvent, Origin } from '../lib/log';
import loggedUser from '../../__tests__/fixture/loggedUser';

let mockEventCallback: (event: PaddleEventData) => void;

jest.mock('@paddle/paddle-js', () => ({
  ...jest.requireActual('@paddle/paddle-js'),
  initializePaddle: jest.fn(
    ({ eventCallback }: { eventCallback: typeof mockEventCallback }) => {
      mockEventCallback = eventCallback;
      return Promise.resolve(undefined);
    },
  ),
}));

const LogContext = getLogContextStatic();
const logEvent = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthContext.Provider
    value={{ user: loggedUser } as unknown as AuthContextData}
  >
    <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
      {children}
    </LogContext.Provider>
  </AuthContext.Provider>
);

const fireCheckoutEvent = (event: Record<string, unknown>) =>
  act(() => mockEventCallback(event as unknown as PaddleEventData));

const payment = { method_details: { type: 'card' } };

describe('usePaddlePayment', () => {
  const token = process.env.NEXT_PUBLIC_PADDLE_TOKEN;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_PADDLE_TOKEN = 'test_token';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_PADDLE_TOKEN = token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should tag checkout events with where the purchase started', () => {
    renderHook(
      () =>
        usePaddlePayment({
          priceType: PurchaseType.Cores,
          origin: Origin.BoostPost,
          successCallback: jest.fn(),
        }),
      { wrapper },
    );

    fireCheckoutEvent({
      name: CheckoutEventNames.CHECKOUT_LOADED,
      data: { payment },
    });
    fireCheckoutEvent({
      name: CheckoutEventNames.CHECKOUT_COMPLETED,
      data: {
        payment,
        custom_data: {},
        items: [{ price_id: 'pri_600' }],
        totals: { total: '5.99' },
        currency_code: 'USD',
      },
    });

    const logged = logEvent.mock.calls.map(([event]) => ({
      event_name: event.event_name,
      extra: JSON.parse(event.extra),
    }));
    expect(logged).toEqual([
      {
        event_name: LogEvent.InitiateCheckout,
        extra: { origin: Origin.BoostPost },
      },
      {
        event_name: LogEvent.CompleteCheckout,
        extra: expect.objectContaining({ origin: Origin.BoostPost }),
      },
    ]);
  });

  it('should add the caller extra to every checkout event', () => {
    renderHook(
      () =>
        usePaddlePayment({
          priceType: PurchaseType.Startups,
          logExtra: { plan: 'starter', source_id: 'squad-1' },
          successCallback: jest.fn(),
        }),
      { wrapper },
    );

    fireCheckoutEvent({
      name: CheckoutEventNames.CHECKOUT_LOADED,
      data: { payment },
    });
    fireCheckoutEvent({
      name: CheckoutEventNames.CHECKOUT_PAYMENT_FAILED,
      data: { payment },
    });

    expect(
      logEvent.mock.calls.map(([event]) => JSON.parse(event.extra)),
    ).toEqual([
      expect.objectContaining({ plan: 'starter', source_id: 'squad-1' }),
      expect.objectContaining({ plan: 'starter', source_id: 'squad-1' }),
    ]);
  });
});
