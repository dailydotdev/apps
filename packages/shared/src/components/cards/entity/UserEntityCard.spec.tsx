import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserEntityCard from './UserEntityCard';
import AuthContext from '../../../contexts/AuthContext';
import type { LoggedUser, UserShortProfile } from '../../../lib/user';
import { webappUrl } from '../../../lib/constants';

jest.mock(
  '../../../hooks/contentPreference/useContentPreferenceStatusQuery',
  () => ({
    useContentPreferenceStatusQuery: () => ({ data: undefined }),
  }),
);

jest.mock('../../../hooks/useShowFollowAction', () => ({
  __esModule: true,
  default: () => ({ isLoading: false, showActionBtn: true }),
}));

const user: UserShortProfile = {
  id: 'u1',
  username: 'johndoe',
  name: 'John Doe',
  image: 'https://daily.dev/john.jpg',
  permalink: 'https://daily.dev/johndoe',
  createdAt: '2024-01-01T00:00:00.000Z',
  bio: 'hello',
  reputation: 10,
} as UserShortProfile;

const renderComponent = (loggedUserId?: string) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider
        value={
          {
            user: loggedUserId ? ({ id: loggedUserId } as LoggedUser) : null,
            menu: null,
            showLogin: jest.fn(),
            logout: jest.fn(),
            updateUser: jest.fn(),
            tokenRefreshed: true,
            getRedirectUri: jest.fn(),
          } as never
        }
      >
        <UserEntityCard user={user} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

describe('UserEntityCard', () => {
  it('links to the user world', () => {
    renderComponent('other');

    const link = screen.getByLabelText("Visit @johndoe's world");
    expect(link).toHaveAttribute('href', `${webappUrl}world/johndoe`);
  });

  it('keeps the world link for the logged in user, who has no follow button', () => {
    renderComponent('u1');

    expect(screen.getByLabelText("Visit @johndoe's world")).toBeInTheDocument();
    expect(screen.queryByText('Follow')).not.toBeInTheDocument();
  });
});
