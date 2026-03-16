import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AskSearchBanner } from './AskSearchBanner';
import { LogEvent, TargetId } from '../../lib/log';
import { ActionType } from '../../graphql/actions';

const mockLogEvent = jest.fn();
const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockUsePlusSubscription = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: () => mockUsePlusSubscription(),
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
      <AskSearchBanner />
    </QueryClientProvider>,
  );

describe('AskSearchBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({ isAuthReady: true });
    mockUsePlusSubscription.mockReturnValue({ isPlus: true });
    mockCheckHasCompleted.mockReturnValue(false);
  });

  it('should render banner for Plus users', () => {
    renderComponent();

    expect(
      screen.getByText('Get better answers with daily-dev-ask'),
    ).toBeInTheDocument();
    expect(screen.getByText('Try daily-dev-ask')).toBeInTheDocument();
  });

  it('should not render for non-Plus users', () => {
    mockUsePlusSubscription.mockReturnValue({ isPlus: false });

    renderComponent();

    expect(
      screen.queryByText('Get better answers with daily-dev-ask'),
    ).not.toBeInTheDocument();
  });

  it('should not render when dismissed via action', () => {
    mockCheckHasCompleted.mockReturnValue(true);

    renderComponent();

    expect(
      screen.queryByText('Get better answers with daily-dev-ask'),
    ).not.toBeInTheDocument();
  });

  it('should not render when not authenticated', () => {
    mockUseAuthContext.mockReturnValue({ isAuthReady: false });

    renderComponent();

    expect(
      screen.queryByText('Get better answers with daily-dev-ask'),
    ).not.toBeInTheDocument();
  });

  it('should log impression on render', () => {
    renderComponent();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_id: TargetId.AskUpsellSearch,
    });
  });

  it('should log click and navigate on CTA', () => {
    renderComponent();

    const ctaLink = screen.getByRole('link', { name: 'Try daily-dev-ask' });
    fireEvent.click(ctaLink);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: TargetId.AskUpsellSearch,
    });

    expect(ctaLink).toHaveAttribute('href', '/agents/ask');
  });

  it('should log dismiss and complete action on dismiss', async () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: TargetId.AskUpsellSearch,
      extra: JSON.stringify({ action: 'dismiss' }),
    });
    await waitFor(() => {
      expect(mockCompleteAction).toHaveBeenCalledWith(
        ActionType.AskUpsellSearch,
      );
    });
  });
});
