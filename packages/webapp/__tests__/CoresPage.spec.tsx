import type { ReactNode } from 'react';
import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import { useViewSizeClient } from '@dailydotdev/shared/src/hooks';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import CoresPage from '../pages/cores';
import CoresPaymentPage from '../pages/cores/payment';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));

jest.mock('@dailydotdev/shared/src/hooks', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/hooks'),
  useViewSizeClient: jest.fn(),
}));

jest.mock(
  '@dailydotdev/shared/src/contexts/BuyCoresContext/BuyCoresContext',
  () => ({
    BuyCoresContextProvider: ({ children }: { children: ReactNode }) =>
      children,
    useCoreProductOptionQuery: () => undefined,
  }),
);

jest.mock('@dailydotdev/shared/src/contexts/BuyCoresContext/types', () => ({
  useBuyCoresContext: () => ({
    selectedProduct: { id: 'pri_cores' },
    openCheckout: jest.fn(),
    setSelectedProduct: jest.fn(),
  }),
}));

jest.mock(
  '@dailydotdev/shared/src/components/modals/award/BuyCoresModal',
  () => ({
    BuyCoresCheckout: () => null,
    CoreOptions: () => null,
    CoreCheckoutPlaceholder: () => null,
    TransactionStatusListener: () => null,
  }),
);

const mockUseRouter = jest.mocked(useRouter);
const mockUseViewSizeClient = jest.mocked(useViewSizeClient);

const query = { origin: Origin.Award, next: '/posts/p1' };

describe('Cores page origin', () => {
  it('should keep the origin when a phone picks a pack', () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ query, push } as never);
    mockUseViewSizeClient.mockReturnValue(false);
    window.history.pushState({}, '', '/cores?origin=award&next=%2Fposts%2Fp1');

    render(<CoresPage />);

    expect(push).toHaveBeenCalledWith(
      `${webappUrl}cores/payment?next=%2Fposts%2Fp1&origin=award&pid=pri_cores`,
    );
  });

  it('should keep the origin when the payment page sends a laptop back', () => {
    const replace = jest.fn();
    mockUseRouter.mockReturnValue({ query, isReady: true, replace } as never);
    mockUseViewSizeClient.mockReturnValue(true);
    window.history.pushState(
      {},
      '',
      '/cores/payment?origin=award&next=%2Fposts%2Fp1',
    );

    render(<CoresPaymentPage />);

    expect(replace).toHaveBeenCalledWith(
      `${webappUrl}cores?next=%2Fposts%2Fp1&origin=award`,
    );
  });
});
