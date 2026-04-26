import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HighlightCardOptions } from './HighlightCardOptions';
import type { MenuItemProps } from '../../dropdown/common';

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

jest.mock('../../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuOptions: ({ options }: { options: MenuItemProps[] }) => (
    <div>
      {options.map(({ label, action }) => (
        <button key={label} type="button" onClick={action}>
          {label}
        </button>
      ))}
    </div>
  ),
}));

const renderComponent = () => render(<HighlightCardOptions />);

describe('HighlightCardOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { id: '1' } });
    mockUseConditionalFeature.mockReturnValue({ value: true });
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    });
  });

  it('should render trigger button when feature is on and user is logged in', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Highlight options' }),
    ).toBeInTheDocument();
  });

  it('should not render for guests', () => {
    mockUseAuth.mockReturnValue({ user: undefined });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Highlight options' }),
    ).not.toBeInTheDocument();
  });

  it('should not render when feature is off', () => {
    mockUseConditionalFeature.mockReturnValue({ value: false });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Highlight options' }),
    ).not.toBeInTheDocument();
  });

  it('should show subscribe label when not subscribed and trigger subscribe on click', async () => {
    renderComponent();

    fireEvent.click(screen.getByText('Get real-time alerts'));

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

    fireEvent.click(screen.getByText('Get real-time alerts'));

    await waitFor(() => {
      expect(mockDisplayToast).toHaveBeenCalled();
    });

    const toastArgs = mockDisplayToast.mock.calls[0][1];
    toastArgs.action.onClick();

    expect(mockRouterPush).toHaveBeenCalledWith('/settings/notifications');
  });

  it('should show unsubscribe label when subscribed and trigger unsubscribe on click', async () => {
    mockUseMajorHeadlinesSubscription.mockReturnValue({
      isSubscribed: true,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    });

    renderComponent();

    fireEvent.click(screen.getByText('Turn off real-time alerts'));

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalledWith('feed_card');
    });
  });
});
