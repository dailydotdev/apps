import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HighlightCardOptions } from './HighlightCardOptions';
import { HighlightSignificance } from '../../../graphql/highlights';

const mockSubscribeChannel = jest.fn().mockResolvedValue(undefined);
const mockUnsubscribeChannel = jest.fn().mockResolvedValue(undefined);
const mockIsChannelSubscribed = jest.fn();
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

const renderComponent = (channel = 'tech') =>
  render(<HighlightCardOptions channel={channel} />);

describe('HighlightCardOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    mockUseConditionalFeature.mockReturnValue({ value: true });
    mockIsChannelSubscribed.mockReturnValue(false);
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isChannelSubscribed: mockIsChannelSubscribed,
      isLoading: false,
      isPending: false,
      subscribeChannel: mockSubscribeChannel,
      unsubscribeChannel: mockUnsubscribeChannel,
    });
  });

  it('should render bell button when feature is on, user is logged in and channel is provided', () => {
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

  it('should not render when channel is missing', () => {
    render(<HighlightCardOptions />);

    expect(
      screen.queryByRole('button', { name: 'Get real-time alerts' }),
    ).not.toBeInTheDocument();
  });

  it('should subscribe channel at Major+ and show toast with settings action when not subscribed', async () => {
    renderComponent('tech');

    fireEvent.click(
      screen.getByRole('button', { name: 'Get real-time alerts' }),
    );

    await waitFor(() => {
      expect(mockSubscribeChannel).toHaveBeenCalledWith(
        'tech',
        HighlightSignificance.Major,
        'feed_card',
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

  it('should unsubscribe when channel is already subscribed', async () => {
    mockIsChannelSubscribed.mockReturnValue(true);

    renderComponent('tech');

    fireEvent.click(
      screen.getByRole('button', { name: 'Turn off real-time alerts' }),
    );

    await waitFor(() => {
      expect(mockUnsubscribeChannel).toHaveBeenCalledWith('tech', 'feed_card');
    });
    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalledWith(
        'Real-time alerts turned off.',
      );
    });
  });
});
