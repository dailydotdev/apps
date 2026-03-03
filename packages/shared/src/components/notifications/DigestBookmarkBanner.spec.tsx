import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DigestBookmarkBanner } from './DigestBookmarkBanner';
import { LogEvent, TargetId } from '../../lib/log';
import { UserPersonalizedDigestType } from '../../graphql/users';
import { ActionType } from '../../graphql/actions';

const mockLogEvent = jest.fn();
const mockGetPersonalizedDigest = jest.fn();
const mockSubscribePersonalizedDigest = jest.fn().mockResolvedValue({});
const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockUsePlusSubscription = jest.fn();

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

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    checkHasCompleted: mockCheckHasCompleted,
    completeAction: mockCompleteAction,
    isActionsFetched: true,
  }),
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
    mockCheckHasCompleted.mockReturnValue(false);
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

  it('should not render when dismissed via action', () => {
    mockCheckHasCompleted.mockReturnValue(true);

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

  it('should subscribe, complete action, and log click on CTA', async () => {
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

    await waitFor(() => {
      expect(mockCompleteAction).toHaveBeenCalledWith(
        ActionType.DismissDigestBookmarkUpsell,
      );
    });
  });

  it('should complete action on dismiss', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockCompleteAction).toHaveBeenCalledWith(
      ActionType.DismissDigestBookmarkUpsell,
    );
  });
});
