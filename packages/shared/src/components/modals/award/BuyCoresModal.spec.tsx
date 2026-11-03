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

jest.mock('../../../hooks/usePaddlePayment', () => ({
  usePaddlePayment: jest.fn(() => ({
    paddle: {},
    openCheckout: jest.fn(),
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

const renderModal = (origin: Origin) => {
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

  it('should log buying more Cores from its header with the modal origin', () => {
    renderModal(Origin.BoostPost);

    const [buyMore] = screen
      .getAllByRole('button')
      .filter((button) => button.title !== 'Close');
    fireEvent.click(buyMore);

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.StartBuyingCredits,
      extra: JSON.stringify({ origin: Origin.BoostPost }),
    });
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
