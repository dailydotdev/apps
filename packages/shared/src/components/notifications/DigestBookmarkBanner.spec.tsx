import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DigestBookmarkBanner } from './DigestBookmarkBanner';
import { LogEvent, TargetId } from '../../lib/log';
import { UserPersonalizedDigestType } from '../../graphql/users';

const mockLogEvent = jest.fn();
const mockGetPersonalizedDigest = jest.fn();
const mockSubscribePersonalizedDigest = jest.fn().mockResolvedValue({});
const mockSetDismissed = jest.fn().mockResolvedValue(undefined);
const mockUsePlusSubscription = jest.fn();
const mockPersistentContext = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: () => mockUsePlusSubscription(),
}));

jest.mock('../../hooks/usePersonalizedDigest', () => ({
  usePersonalizedDigest: () => ({
    getPersonalizedDigest: mockGetPersonalizedDigest,
    subscribePersonalizedDigest: mockSubscribePersonalizedDigest,
  }),
  SendType: { Workdays: 'workdays', Daily: 'daily', Weekly: 'weekly' },
}));

jest.mock('../../hooks/usePersistentContext', () => ({
  __esModule: true,
  PersistentContextKeys: {
    DigestBookmarkUpsellDismissed: 'digest_bookmark_upsell_dismissed',
  },
  default: (...args: unknown[]) => mockPersistentContext(...args),
}));

const client = new QueryClient();

const renderComponent = () =>
  render(
    <QueryClientProvider client={client}>
      <DigestBookmarkBanner />
    </QueryClientProvider>,
  );

describe('DigestBookmarkBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePlusSubscription.mockReturnValue({ isPlus: false });
    mockGetPersonalizedDigest.mockReturnValue(null);
    mockPersistentContext.mockReturnValue([false, mockSetDismissed, true]);
  });

  it('should render banner for non-Plus user without digest', () => {
    renderComponent();

    expect(screen.getByText('Never miss the best posts')).toBeInTheDocument();
    expect(screen.getByText('Enable digest')).toBeInTheDocument();
  });

  it('should not render for Plus users', () => {
    mockUsePlusSubscription.mockReturnValue({ isPlus: true });

    renderComponent();

    expect(
      screen.queryByText('Never miss the best posts'),
    ).not.toBeInTheDocument();
  });

  it('should not render when user has digest subscription', () => {
    mockGetPersonalizedDigest.mockImplementation(
      (type: UserPersonalizedDigestType) =>
        type === UserPersonalizedDigestType.Digest
          ? {
              type: UserPersonalizedDigestType.Digest,
              preferredHour: 9,
              flags: { sendType: 'workdays' },
            }
          : null,
    );

    renderComponent();

    expect(
      screen.queryByText('Never miss the best posts'),
    ).not.toBeInTheDocument();
  });

  it('should not render when dismissed', () => {
    mockPersistentContext.mockReturnValue([true, mockSetDismissed, true]);

    renderComponent();

    expect(
      screen.queryByText('Never miss the best posts'),
    ).not.toBeInTheDocument();
  });

  it('should not render while persistent context is loading', () => {
    mockPersistentContext.mockReturnValue([false, mockSetDismissed, false]);

    renderComponent();

    expect(
      screen.queryByText('Never miss the best posts'),
    ).not.toBeInTheDocument();
  });

  it('should log impression on render', () => {
    renderComponent();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_id: TargetId.DigestUpsellBookmarks,
    });
  });

  it('should subscribe and log click on CTA', async () => {
    renderComponent();

    const ctaButton = screen.getByText('Enable digest');
    fireEvent.click(ctaButton);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: TargetId.DigestUpsellBookmarks,
    });

    await waitFor(() => {
      expect(mockSubscribePersonalizedDigest).toHaveBeenCalledWith({
        hour: 9,
        sendType: 'workdays',
        type: UserPersonalizedDigestType.Digest,
      });
    });
  });

  it('should dismiss banner on close button click', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockSetDismissed).toHaveBeenCalledWith(true);
  });
});
