import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileTooltip } from './ProfileTooltip';
import { AuthContextProvider } from '../../contexts/AuthContext';
import loggedUser from '../../../__tests__/fixture/loggedUser';

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <AuthContextProvider
          user={loggedUser}
          updateUser={jest.fn()}
          getRedirectUri={jest.fn()}
          tokenRefreshed
        >
          {children}
        </AuthContextProvider>
      </QueryClientProvider>
    );
  };
};

describe('ProfileTooltip', () => {
  describe('Accessibility', () => {
    it('should not open tooltip on keyboard focus (WCAG 3.2.1)', async () => {
      const user = userEvent.setup();
      
      render(
        <ProfileTooltip userId="user-123">
          <button data-testid="trigger-button">User Profile</button>
        </ProfileTooltip>,
        { wrapper: createWrapper() },
      );

      const triggerButton = screen.getByTestId('trigger-button');
      
      // Focus the button via keyboard (Tab)
      await user.tab();
      
      // The button should be focused
      expect(triggerButton).toHaveFocus();
      
      // But the tooltip should NOT be visible
      // Tippy creates tooltip content in a separate portal
      // If tooltip opened, it would contain UserEntityCard content
      expect(screen.queryByTestId('user-entity-card')).not.toBeInTheDocument();
    });

    it('should render children correctly', () => {
      render(
        <ProfileTooltip userId="user-123">
          <button>User Profile</button>
        </ProfileTooltip>,
        { wrapper: createWrapper() },
      );

      expect(screen.getByRole('button', { name: 'User Profile' })).toBeInTheDocument();
    });
  });
});
