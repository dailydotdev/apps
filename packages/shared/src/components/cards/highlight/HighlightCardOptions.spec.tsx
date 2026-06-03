import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { HighlightCardOptions } from './HighlightCardOptions';
import type { MenuItemProps } from '../../dropdown/common';
import {
  HighlightsPlacement,
  SidebarSettingsFlags,
} from '../../../graphql/settings';

const mockDisplayToast = jest.fn();
const mockUseAuth = jest.fn();
const mockUpdateFlag = jest.fn().mockResolvedValue(undefined);
const mockUseSettingsContext = jest.fn();
const mockLogEvent = jest.fn();
const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
const mockUseActiveFeedContext = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  ...(jest.requireActual('@tanstack/react-query') as Iterable<unknown>),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('../../../contexts/ActiveFeedContext', () => ({
  useActiveFeedContext: () => mockUseActiveFeedContext(),
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
    mockUseSettingsContext.mockReturnValue({
      flags: { highlightsPlacement: HighlightsPlacement.Default },
      updateFlag: mockUpdateFlag,
    });
    mockUseActiveFeedContext.mockReturnValue({
      queryKey: ['feed', 'main'],
      items: [],
    });
  });

  it('should render the placement options when the user is logged in', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Pin to top' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disable' })).toBeInTheDocument();
  });

  it('should not render for guests', () => {
    mockUseAuth.mockReturnValue({ user: undefined });

    renderComponent();

    expect(
      screen.queryByRole('button', { name: 'Pin to top' }),
    ).not.toBeInTheDocument();
  });

  it('should pin to top by updating the placement flag and invalidating the feed', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Pin to top' }));

    await waitFor(() => {
      expect(mockUpdateFlag).toHaveBeenCalledWith(
        SidebarSettingsFlags.Highlights,
        HighlightsPlacement.Pinned,
      );
    });
    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ['feed', 'main'],
      });
    });
    expect(mockDisplayToast).toHaveBeenCalledWith(
      'Happening Now placement preference applied to all your feeds',
    );
  });

  it('should skip feed invalidation when no active feed query key is set', async () => {
    mockUseActiveFeedContext.mockReturnValue({ items: [] });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Pin to top' }));

    await waitFor(() => {
      expect(mockUpdateFlag).toHaveBeenCalled();
    });
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
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
});
