import React from 'react';
import { render } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import { useAtomValue } from 'jotai';
import { FunnelCheckout } from './FunnelCheckout';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePaymentContext } from '../../../contexts/payment/context';
import { usePlusSubscription } from '../../../hooks';
import { applyDiscountAtom, selectedPlanAtom } from '../store/funnel.store';

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('../../../contexts/payment/context', () => ({
  usePaymentContext: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  usePlusSubscription: jest.fn(),
}));

describe('FunnelCheckout', () => {
  beforeEach(() => {
    mocked(useAuthContext).mockReturnValue({
      isValidRegion: true,
    } as ReturnType<typeof useAuthContext>);
    mocked(usePlusSubscription).mockReturnValue({
      isPlus: false,
      logSubscriptionEvent: jest.fn(),
      plusHref: '/plus',
    } as unknown as ReturnType<typeof usePlusSubscription>);
    mocked(useAtomValue).mockImplementation((atom) => {
      if (atom === selectedPlanAtom) {
        return 'pri_123';
      }

      if (atom === applyDiscountAtom) {
        return true;
      }

      return undefined;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (isActive = true): ReturnType<typeof render> => {
    return render(
      <FunnelCheckout
        id="checkout-step"
        onTransition={jest.fn()}
        parameters={{ discountCode: 'DISCOUNT_1' }}
        transitions={[]}
        isActive={isActive}
        type="checkout"
      />,
    );
  };

  it('closes checkout when the step becomes inactive', () => {
    const closeCheckout = jest.fn();
    const openCheckout = jest.fn();

    mocked(usePaymentContext).mockReturnValue({
      closeCheckout,
      isPlusAvailable: true,
      isPricesPending: false,
      isPaddleReady: true,
      openCheckout,
    } as unknown as ReturnType<typeof usePaymentContext>);

    const { rerender } = renderComponent(true);

    rerender(
      <FunnelCheckout
        id="checkout-step"
        onTransition={jest.fn()}
        parameters={{ discountCode: 'DISCOUNT_1' }}
        transitions={[]}
        isActive={false}
        type="checkout"
      />,
    );

    expect(openCheckout).toHaveBeenCalledWith({
      discountId: 'DISCOUNT_1',
      priceId: 'pri_123',
    });
    expect(closeCheckout).toHaveBeenCalledTimes(1);
  });

  it('closes checkout when the step unmounts', () => {
    const closeCheckout = jest.fn();

    mocked(usePaymentContext).mockReturnValue({
      closeCheckout,
      isPlusAvailable: true,
      isPricesPending: false,
      isPaddleReady: true,
      openCheckout: jest.fn(),
    } as unknown as ReturnType<typeof usePaymentContext>);

    const { unmount } = renderComponent(true);

    unmount();

    expect(closeCheckout).toHaveBeenCalledTimes(1);
  });
});
