import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EnableHighlightsAlerts } from './EnableHighlightsAlerts';
import { LogEvent } from '../../lib/log';
import { ActionType } from '../../graphql/actions';

const mockLogEvent = jest.fn();
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockDisplayToast = jest.fn();
const mockUseAuth = jest.fn();
const mockUseConditionalFeature = jest.fn();
const mockUseMajorHeadlinesSubscription = jest.fn();

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuth(),
}));

jest.mock('../../hooks/useActions', () => ({
  useActions: () => ({
    checkHasCompleted: mockCheckHasCompleted,
    completeAction: mockCompleteAction,
    isActionsFetched: true,
  }),
}));

jest.mock('../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../hooks/notifications/useMajorHeadlinesSubscription', () => ({
  useMajorHeadlinesSubscription: () => mockUseMajorHeadlinesSubscription(),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const renderComponent = () => render(<EnableHighlightsAlerts />);

describe('EnableHighlightsAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    mockUseConditionalFeature.mockReturnValue({ value: true });
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: false,
      subscribe: mockSubscribe,
      unsubscribe: jest.fn(),
    });
    mockCheckHasCompleted.mockReturnValue(false);
  });

  it('should render banner when feature is on, user is logged in, not subscribed and not dismissed', () => {
    renderComponent();

    expect(
      screen.getByText('Get real-time alerts when news breaks'),
    ).toBeInTheDocument();
    expect(screen.getByText('Turn on alerts')).toBeInTheDocument();
  });

  it('should not render when feature is off', () => {
    mockUseConditionalFeature.mockReturnValue({ value: false });

    renderComponent();

    expect(
      screen.queryByText('Get real-time alerts when news breaks'),
    ).not.toBeInTheDocument();
  });

  it('should not render for guests', () => {
    mockUseAuth.mockReturnValue({ user: undefined });

    renderComponent();

    expect(
      screen.queryByText('Get real-time alerts when news breaks'),
    ).not.toBeInTheDocument();
  });

  it('should not render when already subscribed', () => {
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: true,
      subscribe: mockSubscribe,
      unsubscribe: jest.fn(),
    });

    renderComponent();

    expect(
      screen.queryByText('Get real-time alerts when news breaks'),
    ).not.toBeInTheDocument();
  });

  it('should not render when dismissed', () => {
    mockCheckHasCompleted.mockReturnValue(true);

    renderComponent();

    expect(
      screen.queryByText('Get real-time alerts when news breaks'),
    ).not.toBeInTheDocument();
  });

  it('should log impression on render', () => {
    renderComponent();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ImpressionMajorHeadlinesAlertsBanner,
      extra: JSON.stringify({ origin: 'highlights_page' }),
    });
  });

  it('should subscribe and show toast on CTA click', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Turn on alerts'));

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith('highlights_page');
    });

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(
        "You'll be the first to know when news breaks.",
      );
    });
  });

  it('should complete dismiss action and log dismiss on close', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.DismissMajorHeadlinesAlertsBanner,
      extra: JSON.stringify({ origin: 'highlights_page' }),
    });

    await waitFor(() => {
      expect(mockCompleteAction).toHaveBeenCalledWith(
        ActionType.DismissedMajorHeadlinesAlertsBanner,
      );
    });
  });
});
