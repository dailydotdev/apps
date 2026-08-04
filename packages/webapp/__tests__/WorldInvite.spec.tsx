import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import type {
  LoggedUser,
  PublicProfile,
} from '@dailydotdev/shared/src/lib/user';
import loggedUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { WorldInvite } from '../components/world/WorldInvite';

/* The real one mounts the whole auth form. Everything this file is about is the
   choice of WHICH call to action a reader gets, not what the signup card is
   made of. */
jest.mock('../components/world/WorldSignupCta', () => ({
  WorldSignupCta: () => <div data-testid="signup" />,
}));

const owner = {
  id: 'u1',
  name: 'Ido',
  username: 'ido',
  permalink: 'http://localhost:5002/ido',
} as PublicProfile;

const renderInvite = (viewer?: LoggedUser) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={{
          user: viewer,
          isAuthReady: true,
          shouldShowLogin: false,
          showLogin: jest.fn(),
          logout: jest.fn(),
          closeLogin: jest.fn(),
          getRedirectUri: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          trackingId: '',
          isLoggedIn: !!viewer,
        }}
      >
        <WorldInvite user={owner} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

describe('WorldInvite', () => {
  it('sends the owner of unbuilt ground off to read something', () => {
    renderInvite({ ...loggedUser, id: owner.id } as LoggedUser);

    expect(
      screen.getByRole('link', { name: 'Read to build your world' }),
    ).toHaveAttribute('href', '/');
    expect(screen.getByText('Your journey has just begun')).toBeInTheDocument();
    expect(screen.queryByTestId('signup')).not.toBeInTheDocument();
  });

  it('sends a visitor to their own world instead', () => {
    renderInvite({ ...loggedUser, id: 'u2', username: 'visitor' });

    expect(screen.getByText('This journey has just begun')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'See your own world' }),
    ).toHaveAttribute('href', '/world/visitor');
  });

  it('offers a reader with no account one, and never a world of their own', () => {
    renderInvite();

    expect(screen.getByTestId('signup')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /world/ }),
    ).not.toBeInTheDocument();
  });
});
