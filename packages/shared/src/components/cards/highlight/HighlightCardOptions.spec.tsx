import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HighlightCardOptions } from './HighlightCardOptions';

const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockUnsubscribe = jest.fn().mockResolvedValue(undefined);
const mockDisplayToast = jest.fn();
const mockUseAuth = jest.fn();
const mockUseConditionalFeature = jest.fn();
const mockUseMajorHeadlinesSubscription = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuth(),
}));

jest.mock('../../../hooks/useConditionalFeature', () => ({
  useConditionalFeature: () => mockUseConditionalFeature(),
}));

jest.mock('../../../hooks/notifications/useMajorHeadlinesSubscription', () => ({
  useMajorHeadlinesSubscription: () => mockUseMajorHeadlinesSubscription(),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../tooltip/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderComponent = () => render(<HighlightCardOptions />);

describe('HighlightCardOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    mockUseConditionalFeature.mockReturnValue({ value: true });
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: false,
      isLoading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    });
  });

  it('should render bell button when feature is on and user is logged in', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Get real-time alerts' }),
    ).toBeInTheDocument();
  });

  it('should not render for guests', () => {
    mockUseAuth.mockReturnValue({ user: undefined });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Get real-time alerts' }),
    ).not.toBeInTheDocument();
  });

  it('should not render when feature is off', () => {
    mockUseConditionalFeature.mockReturnValue({ value: false });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Get real-time alerts' }),
    ).not.toBeInTheDocument();
  });

  it('should subscribe and show toast with settings action when not subscribed', async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Get real-time alerts' }),
    );

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalledWith('feed_card');
    });
    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(
        "You'll be the first to know when news breaks.",
        expect.objectContaining({
          action: expect.objectContaining({ copy: 'Settings' }),
        }),
      );
    });
  });

  it('should navigate to notification settings when toast action is clicked', async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Get real-time alerts' }),
    );

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalled();
    });

    const toastArgs = mockDisplayToast.mock.calls[0][1];
    toastArgs.action.onClick();

    expect(mockRouterPush).toHaveBeenCalledWith('/settings/notifications');
  });

  it('should unsubscribe when subscribed', async () => {
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: true,
      isLoading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    });

    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Turn off real-time alerts' }),
    );

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalledWith('feed_card');
    });
    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'Real-time alerts turned off.',
      );
    });
  });
});
