import React from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaddleBuyCoresContextProvider } from './PaddleBuyCoresContext';
import { useBuyCoresContext } from './types';
import type { BuyCoresContextData } from './types';
import { Origin } from '../../lib/log';
import { usePaddlePayment } from '../../hooks/usePaddlePayment';

jest.mock('../../hooks/usePaddlePayment', () => ({
  usePaddlePayment: jest.fn(),
}));
jest.mock('../LogContext', () => ({
  useLogContext: () => ({ logEvent: jest.fn() }),
}));
jest.mock('../AuthContext', () => ({
  useAuthContext: () => ({ user: { id: 'u1' }, isLoggedIn: true }),
}));

const openPaddleCheckout = jest.fn();

const renderContext = (squadWalletId?: string): BuyCoresContextData => {
  let context: BuyCoresContextData;
  const Consumer = () => {
    context = useBuyCoresContext();
    return null;
  };

  render(
    <QueryClientProvider client={new QueryClient()}>
      <PaddleBuyCoresContextProvider
        origin={Origin.BoostPost}
        squadWallet={
          squadWalletId
            ? {
                sourceId: squadWalletId,
                name: 'Acme',
                handle: 'acme',
                balance: 0,
              }
            : undefined
        }
      >
        <Consumer />
      </PaddleBuyCoresContextProvider>
    </QueryClientProvider>,
  );

  return context;
};

beforeEach(() => {
  jest.clearAllMocks();
  (usePaddlePayment as jest.Mock).mockReturnValue({
    paddle: undefined,
    openCheckout: openPaddleCheckout,
  });
});

it('buys Cores into the squad wallet', () => {
  renderContext('squad-1').openCheckout({ priceId: 'pri_1' });

  expect(openPaddleCheckout).toHaveBeenCalledWith({
    priceId: 'pri_1',
    customData: { source_id: 'squad-1' },
  });
});

it('buys Cores for the user without a squad wallet', () => {
  renderContext().openCheckout({ priceId: 'pri_1' });

  expect(openPaddleCheckout).toHaveBeenCalledWith({ priceId: 'pri_1' });
});
