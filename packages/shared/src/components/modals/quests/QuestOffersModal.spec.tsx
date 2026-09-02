import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { UserOffer } from '../../../graphql/offers';
import type { DailyQuestSummary } from '../../../hooks/useQuestDashboard';
import { LogEvent, TargetType } from '../../../lib/log';
import { useViewSize } from '../../../hooks/useViewSize';
import QuestOffersModal from './QuestOffersModal';

const mockConfirmDelivered = jest.fn();

jest.mock('../../../graphql/offers', () => ({
  ...jest.requireActual('../../../graphql/offers'),
  confirmOffersDelivered: (...args: unknown[]) => mockConfirmDelivered(...args),
}));

jest.mock('../../../hooks/useViewSize', () => ({
  ...jest.requireActual('../../../hooks/useViewSize'),
  useViewSize: jest.fn(),
}));

// jsdom has no PointerEvent; MouseEvent carries the clientX the swipe needs
if (typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = MouseEvent as unknown as typeof PointerEvent;
}

const mockUseViewSize = useViewSize as jest.Mock;
const logEvent = jest.fn();
const onRequestClose = jest.fn();
const onShown = jest.fn();

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

const defaultSummary: DailyQuestSummary = {
  total: 3,
  claimed: 3,
  xpEarned: 150,
};

const renderComponent = ({
  summary = defaultSummary,
}: { summary?: DailyQuestSummary } = {}) => {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <TestBootProvider client={client} log={{ logEvent }}>
      <QuestOffersModal
        isOpen
        level={12}
        levelProgress={40}
        summary={summary}
        offers={offers}
        onShown={onShown}
        onRequestClose={onRequestClose}
        ariaHideApp={false}
      />
    </TestBootProvider>,
  );
};

describe('QuestOffersModal', () => {
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
    expect(screen.getByText('Daily quests complete')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('/ 3 quests')).toBeInTheDocument();

    await waitFor(() =>
      expect(mockConfirmDelivered).toHaveBeenCalledWith(
        offers.map((offer) => offer.impressionUid),
      ),
    );
    expect(mockConfirmDelivered).toHaveBeenCalledTimes(1);
    // The variant has to ride every offer event: the split renders all offers
    // at once and the carousel one at a time, so impression counts are only
    // comparable when segmented by it.
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Impression,
        target_type: TargetType.QuestOffer,
        target_id: offers[0].impressionUid,
        extra: JSON.stringify({
          brand: offers[0].advertiserName,
          questsCompleted: 3,
          variant: 'split',
        }),
      }),
    );
  });

  // The popup now rides the first claim, so the headline must not promise the
  // whole set is done until it actually is.
  it('only claims the day is complete once every quest is claimed', () => {
    const { unmount } = renderComponent({
      summary: { total: 3, claimed: 1, xpEarned: 50 },
    });

    expect(screen.getByText('Quest complete')).toBeInTheDocument();
    expect(screen.getByText('/ 3 quests')).toBeInTheDocument();

    unmount();
    renderComponent();

    expect(screen.getByText('Daily quests complete')).toBeInTheDocument();
  });

  // The trigger delegates the once-per-day stamp here so it can only be
  // written for a popup that actually reached the screen.
  it('stamps the day exactly once, on mount', () => {
    const { rerender } = renderComponent();

    expect(onShown).toHaveBeenCalledTimes(1);

    rerender(<div />);
    renderComponent();

    expect(onShown).toHaveBeenCalledTimes(2);
  });

  it('shows the XP earned from the day, and hides the chip when there is none', () => {
    const { unmount } = renderComponent();

    expect(screen.getByText('+150 XP today')).toBeInTheDocument();

    unmount();
    renderComponent({ summary: { ...defaultSummary, xpEarned: 0 } });

    expect(screen.queryByText(/XP today/)).not.toBeInTheDocument();
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
        target_type: TargetType.QuestOffer,
        target_id: offers[0].impressionUid,
      }),
    );
    await waitFor(() =>
      expect(screen.getByText('Claimed')).toBeInTheDocument(),
    );
  });

  it('logs a dismissal when closed via the X on desktop', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Close'));

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.DismissQuestOffers,
        target_type: TargetType.QuestOffer,
        extra: JSON.stringify({
          method: 'close',
          claimed: 0,
          variant: 'split',
        }),
      }),
    );
    expect(onRequestClose).toHaveBeenCalled();
  });

  it('keeps the swiped card when the drag ends with a click on a card', async () => {
    mockUseViewSize.mockReturnValue(true);
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => window);

    renderComponent();

    const firstCard = screen
      .getByText(offers[0].advertiserName)
      .closest('button');

    if (!firstCard) {
      throw new Error('carousel card not found');
    }

    // swipe left past the threshold; browsers then fire a click on the card
    fireEvent.pointerDown(firstCard, { clientX: 200 });
    fireEvent.pointerMove(firstCard, { clientX: 80 });
    fireEvent.pointerUp(firstCard);
    fireEvent.click(firstCard);

    fireEvent.click(screen.getByRole('button', { name: 'Claim gift' }));

    expect(openSpy).toHaveBeenCalledWith(
      offers[1].clickUrl,
      '_blank',
      'noopener,noreferrer',
    );
    await waitFor(() =>
      expect(mockConfirmDelivered).toHaveBeenCalledWith([
        offers[1].impressionUid,
      ]),
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
        event_name: LogEvent.DismissQuestOffers,
        target_type: TargetType.QuestOffer,
        extra: JSON.stringify({
          method: 'decline',
          claimed: 0,
          variant: 'carousel',
        }),
      }),
    );
    expect(onRequestClose).toHaveBeenCalled();
  });
});
