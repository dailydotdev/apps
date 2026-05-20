import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HighlightCardOptions } from './HighlightCardOptions';
import type { MenuItemProps } from '../../dropdown/common';
import {
  HighlightsPlacement,
  SidebarSettingsFlags,
} from '../../../graphql/settings';

const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockUnsubscribe = jest.fn().mockResolvedValue(undefined);
const mockDisplayToast = jest.fn();
const mockUseAuth = jest.fn();
const mockUseConditionalFeature = jest.fn();
const mockUseMajorHeadlinesSubscription = jest.fn();
const mockRouterPush = jest.fn();
const mockUpdateFlag = jest.fn().mockResolvedValue(undefined);
const mockUseSettingsContext = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuth(),
}));

jest.mock('../../../contexts/SettingsContext', () => ({
  useSettingsContext: () => mockUseSettingsContext(),
}));

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
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
      {options.map(({ label, action, disabled }) => (
        <button key={label} type="button" onClick={action} disabled={disabled}>
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
      isLoading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
    });
    mockUseSettingsContext.mockReturnValue({
      flags: { highlightsPlacement: HighlightsPlacement.Default },
      updateFlag: mockUpdateFlag,
    });
  });

  it('should render the options menu with all items when feature is on and user is logged in', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Pin to top' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable' })).toBeInTheDocument();
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

  it('should pin to top by updating the placement flag', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Pin to top' }));

    await waitFor(() => {
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        SidebarSettingsFlags.Highlights,
        HighlightsPlacement.Pinned,
      );
    });
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Happening Now placement preference applied to all your feeds',
    );
  });

  it('should unpin by setting placement back to Default', async () => {
    mockUseSettingsContext.mockReturnValue({
      flags: { highlightsPlacement: HighlightsPlacement.Pinned },
      updateFlag: mockUpdateFlag,
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Unpin from top' }));

    await waitFor(() => {
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        SidebarSettingsFlags.Highlights,
        HighlightsPlacement.Default,
      );
    });
  });

  it('should disable the card by setting placement to Disabled', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Disable' }));

    await waitFor(() => {
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        SidebarSettingsFlags.Highlights,
        HighlightsPlacement.Disabled,
      );
    });
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
