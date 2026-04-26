import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EnableHighlightsAlerts } from './EnableHighlightsAlerts';
import { LogEvent } from '../../lib/log';
import { ActionType } from '../../graphql/actions';
import { HighlightSignificance } from '../../graphql/highlights';

const mockLogEvent = jest.fn();
const mockSubscribeAll = jest.fn().mockResolvedValue(undefined);
const mockCompleteAction = jest.fn().mockResolvedValue(undefined);
const mockCheckHasCompleted = jest.fn();
const mockDisplayToast = jest.fn();
const mockUseAuth = jest.fn();
const mockUseConditionalFeature = jest.fn();
const mockUseMajorHeadlinesSubscription = jest.fn();
const mockRouterPush = jest.fn();
const mockUsePushNotificationContext = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../contexts/PushNotificationContext', () => ({
  usePushNotificationContext: () => mockUsePushNotificationContext(),
}));

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

const defaultHookReturn = (overrides = {}) => ({
  isAnyChannelSubscribed: false,
  isLoading: false,
  isPending: false,
  subscribeAll: mockSubscribeAll,
  ...overrides,
});

describe('EnableHighlightsAlerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    mockUseConditionalFeature.mockReturnValue({ value: true });
    mockUseMajorHeadlinesSubscription.mockReturnValue(defaultHookReturn());
    mockCheckHasCompleted.mockReturnValue(false);
    mockUsePushNotificationContext.mockReturnValue({ isSubscribed: false });
  });

  it('should render banner when feature is on, user is logged in, no channels subscribed and not dismissed', () => {
    renderComponent();

    expect(screen.getByText('Push notifications')).toBeInTheDocument();
    expect(screen.getByText('Enable notifications')).toBeInTheDocument();
  });

  it('should not render when feature is off', () => {
    mockUseConditionalFeature.mockReturnValue({ value: false });

    renderComponent();

    expect(screen.queryByText('Push notifications')).not.toBeInTheDocument();
  });

  it('should not render for guests', () => {
    mockUseAuth.mockReturnValue({ user: undefined });

    renderComponent();

    expect(screen.queryByText('Push notifications')).not.toBeInTheDocument();
  });

  it('should not render when any channel is already subscribed', () => {
    mockUseMajorHeadlinesSubscription.mockReturnValue(
      defaultHookReturn({ isAnyChannelSubscribed: true }),
    );

    renderComponent();

    expect(screen.queryByText('Push notifications')).not.toBeInTheDocument();
  });

  it('should not render when dismissed', () => {
    mockCheckHasCompleted.mockReturnValue(true);

    renderComponent();

    expect(screen.queryByText('Push notifications')).not.toBeInTheDocument();
  });

  it('should log impression on render', () => {
    renderComponent();

    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ImpressionMajorHeadlinesAlertsBanner,
      extra: JSON.stringify({ origin: 'highlights_page' }),
    });
  });

  it('should subscribe all channels at Major+ and show toast on CTA click when push is not yet enabled', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Enable notifications'));

    await waitFor(() => {
      expect(mockSubscribeAll).toHaveBeenCalledWith(
        HighlightSignificance.Major,
        'highlights_page',
      );
    });

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(
        "You'll be the first to know when news breaks.",
        expect.objectContaining({
          action: expect.objectContaining({ copy: 'Settings' }),
        }),
      );
    });

    const toastArgs = mockDisplayToast.mock.calls[0][1];
    toastArgs.action.onClick();
    expect(mockRouterPush).toHaveBeenCalledWith('/settings/notifications');
  });

  it('should show enabled state inline when push was already granted', async () => {
    mockUsePushNotificationContext.mockReturnValue({ isSubscribed: true });

    renderComponent();

    fireEvent.click(screen.getByText('Enable notifications'));

    await waitFor(() => {
      expect(mockSubscribeAll).toHaveBeenCalledWith(
        HighlightSignificance.Major,
        'highlights_page',
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('Push notifications successfully enabled'),
      ).toBeInTheDocument();
    });

    expect(mockDisplayToast).not.toHaveBeenCalled();
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
