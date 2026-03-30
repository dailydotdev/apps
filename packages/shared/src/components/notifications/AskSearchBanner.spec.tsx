import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AskSearchBanner } from './AskSearchBanner';
import { LogEvent, TargetId } from '../../lib/log';
import { ActionType } from '../../graphql/actions';

const mockLogEvent = jest.fn();
const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockUseAuthContext = jest.fn();
const mockUseConditionalFeature = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    checkHasCompleted: mockCheckHasCompleted,
    completeAction: mockCompleteAction,
    isActionsFetched: true,
  }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: (args: unknown) => mockUseConditionalFeature(args),
}));

jest.mock('../../lib/constants', () => ({
  webappUrl: 'http://localhost/',
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
    mockCheckHasCompleted.mockReturnValue(false);
    mockUseConditionalFeature.mockReturnValue({
      value: true,
      isLoading: false,
    });
  });

  it('should render banner when feature enabled', () => {
    renderComponent();

    expect(screen.getByText('WebSearch for Developers')).toBeInTheDocument();
    expect(screen.getByText('Try /daily-dev-ask')).toBeInTheDocument();
  });

  it('should not render when feature flag is disabled', () => {
    mockUseConditionalFeature.mockReturnValue({
      value: false,
      isLoading: false,
    });

    renderComponent();

    expect(
      screen.queryByText('WebSearch for Developers'),
    ).not.toBeInTheDocument();
  });

  it('should not render when dismissed via action', () => {
    mockCheckHasCompleted.mockReturnValue(true);

    renderComponent();

    expect(
      screen.queryByText('WebSearch for Developers'),
    ).not.toBeInTheDocument();
  });

  it('should not render while auth is still loading', () => {
    mockUseAuthContext.mockReturnValue({ isAuthReady: false });

    renderComponent();

    expect(
      screen.queryByText('WebSearch for Developers'),
    ).not.toBeInTheDocument();
  });

  it('should evaluate feature only when user is authenticated', () => {
    renderComponent();

    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: true }),
    );
  });

  it('should not evaluate feature while auth is loading', () => {
    mockUseAuthContext.mockReturnValue({ isAuthReady: false });

    renderComponent();

    expect(mockUseConditionalFeature).toHaveBeenCalledWith(
      expect.objectContaining({ shouldEvaluate: false }),
    );
  });

  it('should log impression on render', () => {
    renderComponent();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Impression,
      target_id: TargetId.AskUpsellSearch,
    });
  });

  it('should log click, complete action, and navigate on CTA', async () => {
    renderComponent();

    const ctaLink = screen.getByRole('link', { name: 'Try /daily-dev-ask' });
    fireEvent.click(ctaLink);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Click,
      target_id: TargetId.AskUpsellSearch,
    });

    expect(ctaLink).toHaveAttribute('href', 'http://localhost/agents/ask');

    await waitFor(() => {
      expect(mockCompleteAction).toHaveBeenCalledWith(
        ActionType.AskUpsellSearch,
      );
    });
  });

  it('should log dismiss and complete action on dismiss', async () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.Dismiss,
      target_id: TargetId.AskUpsellSearch,
    });
    await waitFor(() => {
      expect(mockCompleteAction).toHaveBeenCalledWith(
        ActionType.AskUpsellSearch,
      );
    });
  });
});
