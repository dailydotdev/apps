import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { UserOffer } from '../../../graphql/offers';
import { LogEvent, TargetType } from '../../../lib/log';
import { useViewSize } from '../../../hooks/useViewSize';
import StreakOffersModal from './StreakOffersModal';

const mockConfirmDelivered = jest.fn();

jest.mock('../../../graphql/offers', () => ({
  ...jest.requireActual('../../../graphql/offers'),
  confirmOffersDelivered: (...args: unknown[]) => mockConfirmDelivered(...args),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

const mockUseViewSize = useViewSize as jest.Mock;
const logEvent = jest.fn();
const onRequestClose = jest.fn();

const offers: UserOffer[] = [
  {
    impressionUid: '10000000-0000-4000-8000-000000000001',
    clickUrl: 'https://link.encorekit.com/one',
    title: '3 Months of Music, Free',
    advertiserName: 'Acme Music',
    advertiserLogo: 'https://cdn.example.com/music.png',
    perk: '3 months free',
    badgeLabel: 'free_trial',
  },
  {
    impressionUid: '10000000-0000-4000-8000-000000000002',
    clickUrl: 'https://link.encorekit.com/two',
    title: 'Get 50% off Notes Pro',
    advertiserName: 'Acme Notes',
    advertiserLogo: 'https://cdn.example.com/notes.png',
    perk: '50% off',
    badgeLabel: 'discount',
  },
];

const renderComponent = () => {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <StreakOffersModal
        isOpen
        currentStreak={7}
        maxStreak={10}
        offers={offers}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

describe('StreakOffersModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirmDelivered.mockResolvedValue({ _: true });
    mockUseViewSize.mockReturnValue(false);
    document.body.innerHTML = '<div id="__next"></div>';
  });

  it('renders all offers on desktop and confirms delivery once', async () => {
    renderComponent();

    expect(screen.getByText('3 Months of Music, Free')).toBeInTheDocument();
    expect(screen.getByText('Get 50% off Notes Pro')).toBeInTheDocument();
    expect(screen.getByText('7 days streak')).toBeInTheDocument();

    await waitFor(() =>
      expect(mockConfirmDelivered).toHaveBeenCalledWith(
        offers.map((offer) => offer.impressionUid),
      ),
    );
    expect(mockConfirmDelivered).toHaveBeenCalledTimes(1);
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Impression,
        target_type: TargetType.StreakOffer,
        target_id: offers[0].impressionUid,
      }),
    );
  });

  it('opens the tokenized click url and marks the offer claimed', async () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => window);

    renderComponent();

    fireEvent.click(screen.getAllByRole('button', { name: 'Claim' })[0]);

    expect(openSpy).toHaveBeenCalledWith(
      offers[0].clickUrl,
      '_blank',
      'noopener,noreferrer',
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Click,
        target_type: TargetType.StreakOffer,
        target_id: offers[0].impressionUid,
      }),
    );
    await waitFor(() =>
      expect(screen.getByText('Claimed')).toBeInTheDocument(),
    );
  });

  it('confirms only the visible card on mobile and dismisses via no thanks', async () => {
    mockUseViewSize.mockReturnValue(true);

    renderComponent();

    await waitFor(() =>
      expect(mockConfirmDelivered).toHaveBeenCalledWith([
        offers[0].impressionUid,
      ]),
    );
    expect(mockConfirmDelivered).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'No thanks' }));

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.DismissStreakOffers,
        target_type: TargetType.StreakOffer,
      }),
    );
    expect(onRequestClose).toHaveBeenCalled();
  });
});
