import React from 'react';
import { render, screen } from '@testing-library/react';
import type { TooltipProps } from '../tooltips/BaseTooltip';
import AuthContext from '../../contexts/AuthContext';
import { SidebarItem } from './SidebarItem';

const mockSimpleTooltipSpy = jest.fn();

jest.mock('../tooltips', () => ({
  SimpleTooltip: ({ children, ...props }: TooltipProps) => {
    mockSimpleTooltipSpy(props);
    return <div>{children}</div>;
  },
}));

const renderComponent = (shouldShowLabel: boolean) =>
  render(
    <AuthContext.Provider
      value={{
        user: null,
        isAuthReady: true,
        isFetched: true,
        isLoggedIn: false,
        shouldShowLogin: false,
        showLogin: jest.fn(),
        logout: jest.fn(),
        updateUser: jest.fn(),
        tokenRefreshed: true,
        getRedirectUri: jest.fn(),
        closeLogin: jest.fn(),
      }}
    >
      <SidebarItem
        item={{ icon: '🧪', title: 'Custom feed', path: '/custom-feed' }}
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

    expect(
      screen.getByRole('link', { name: /Custom feed/ }),
    ).toBeInTheDocument();
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
});
