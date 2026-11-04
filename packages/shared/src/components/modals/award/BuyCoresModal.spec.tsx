import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { BuyCoresModal } from './BuyCoresModal';
import { usePaddlePayment } from '../../../hooks/usePaddlePayment';
import type { ProductPricingPreview } from '../../../graphql/paddle';
import { PurchaseType } from '../../../graphql/paddle';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { LogEvent, Origin } from '../../../lib/log';
import { CoresRole } from '../../../lib/user';

const mockOpenCheckout = jest.fn();

jest.mock('../../../hooks/usePaddlePayment', () => ({
  usePaddlePayment: jest.fn(() => ({
    paddle: {},
    openCheckout: mockOpenCheckout,
  })),
}));

const user = { ...loggedUser, coresRole: CoresRole.User };
const logEvent = jest.fn();

const prices = [
  {
    priceId: 'pri_600',
    price: { formatted: '$5.99' },
    metadata: { title: '600 Cores', coresValue: 600 },
  },
  {
    priceId: 'pri_1200',
    price: { formatted: '$9.99' },
    metadata: { title: '1,200 Cores', coresValue: 1200 },
  },
] as ProductPricingPreview[];

const renderModal = (origin: Origin, minCoresToBuy?: number) => {
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(RequestKey.PricePreview, user, PurchaseType.Cores),
    prices,
  );

  return render(
    <TestBootProvider client={client} auth={{ user }} log={{ logEvent }}>
      <BuyCoresModal
        isOpen
        origin={origin}
        minCoresToBuy={minCoresToBuy}
        onRequestClose={jest.fn()}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

describe('BuyCoresModal origin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log the picked pack with the modal origin and carry the origin to checkout', () => {
    renderModal(Origin.SquadBoost);

    fireEvent.click(screen.getByRole('radio', { name: /1,200 Cores/ }));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({ origin: Origin.SquadBoost, quantity: 1200 }),
    });
    expect(usePaddlePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        priceType: PurchaseType.Cores,
        origin: Origin.SquadBoost,
      }),
    );
  });
});

describe('BuyCoresModal with Cores to cover', () => {
  const matchMedia = window.matchMedia as jest.Mock;
  const defaultMatchMedia = matchMedia.getMockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    matchMedia.mockImplementation(defaultMatchMedia);
  });

  it('should recommend the smallest pack that covers the missing Cores and dim smaller ones', () => {
    renderModal(Origin.BoostPost, 1000);

    const small = screen.getByRole('radio', { name: /600 Cores/ });
    const covering = screen.getByRole('radio', { name: /1,200 Cores/ });

    expect(covering).toHaveTextContent('Recommended');
    expect(small).not.toHaveTextContent('Recommended');
    expect(small).toHaveClass('opacity-64');
    expect(covering).not.toHaveClass('opacity-64');
    expect(screen.getByText('You need 1,000 more Cores.')).toBeInTheDocument();
  });

  it('should only highlight the recommended pack on mobile', () => {
    renderModal(Origin.BoostPost, 1000);

    expect(mockOpenCheckout).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: /1,200 Cores/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('should open the checkout on the recommended pack on desktop', () => {
    // laptop and up: every min-width media query matches
    matchMedia.mockImplementation(() => ({
      matches: true,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    renderModal(Origin.BoostPost, 1000);

    expect(mockOpenCheckout).toHaveBeenCalledTimes(1);
    expect(mockOpenCheckout).toHaveBeenCalledWith({ priceId: 'pri_1200' });
    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.SelectCreditsQuantity,
      extra: JSON.stringify({
        origin: Origin.BoostPost,
        quantity: 1200,
        preselected: true,
      }),
    });
    expect(screen.getByRole('radio', { name: /1,200 Cores/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('should recommend the biggest pack when none covers the missing Cores', () => {
    renderModal(Origin.BoostPost, 50000);

    expect(
      screen.getByRole('radio', { name: /1,200 Cores/ }),
    ).toHaveTextContent('Recommended');
  });

  it('should not recommend or preselect a pack without Cores to cover', () => {
    renderModal(Origin.BoostPost);

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
    expect(mockOpenCheckout).not.toHaveBeenCalled();
  });
});
