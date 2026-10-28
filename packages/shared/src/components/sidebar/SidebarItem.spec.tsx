import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import AuthContext from '../../contexts/AuthContext';
import { SidebarItem } from './SidebarItem';
import type { SidebarMenuItem } from './common';

const mockSimpleTooltipSpy = jest.fn();

jest.mock('../tooltips', () => ({
  SimpleTooltip: ({ children, ...props }: TooltipProps) => {
    mockSimpleTooltipSpy(props);
    return <div>{children}</div>;
  },
}));

const renderComponent = (
  shouldShowLabel: boolean,
  {
    item = { icon: '🧪', title: 'Custom feed', path: '/custom-feed' },
    showLogin = jest.fn(),
  }: { item?: SidebarMenuItem; showLogin?: jest.Mock } = {},
) =>
  render(
    <AuthContext.Provider
      value={{
        user: undefined,
        isAuthReady: true,
        isAuthReadyOrCached: true,
        isFetched: true,
        isLoggedIn: false,
        shouldShowLogin: false,
        showLogin,
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        isTokenValid: true,
        getRedirectUri: jest.fn(),
        closeLogin: jest.fn(),
      }}
    >
      <SidebarItem
        item={item}
        activePage="/"
        isItemsButton={false}
        shouldShowLabel={shouldShowLabel}
      />
    </AuthContext.Provider>,
  );

describe('SidebarItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap collapsed items with a tooltip on the clickable item', () => {
    renderComponent(false);

    const link = screen.getByRole('link', { name: /Custom feed/ });

    expect(link).toBeInTheDocument();
    expect(link).not.toHaveAttribute('title');
    expect(mockSimpleTooltipSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'Custom feed',
        placement: 'right',
      }),
    );
  });

  it('should not render a tooltip when labels are shown', () => {
    renderComponent(true);

    expect(
      screen.getByRole('link', { name: /Custom feed/ }),
    ).toBeInTheDocument();
    expect(mockSimpleTooltipSpy).not.toHaveBeenCalled();
  });

  it('asks an anonymous user to log in before opening an item that requires it', () => {
    const showLogin = jest.fn();
    renderComponent(true, {
      item: {
        icon: '🧪',
        title: 'Following',
        path: '/following',
        requiresLogin: true,
      },
      showLogin,
    });

    fireEvent.click(screen.getByRole('link', { name: /Following/ }));

    expect(showLogin).toHaveBeenCalledWith({ trigger: 'Following' });
  });
});
