import React from 'react';
import { render, screen } from '@testing-library/react';
import FeedEmptyScreen from './FeedEmptyScreen';
import { AuthContextProvider } from '../contexts/AuthContext';
import type { LoggedUser } from '../lib/user';

jest.mock('../lib/constants', () => ({
  ...jest.requireActual('../lib/constants'),
  webappUrl: 'https://daily.dev/',
}));

const user = {
  id: 'u1',
  name: 'Maya',
  username: 'maya',
  providers: ['google'],
} as LoggedUser;

describe('FeedEmptyScreen', () => {
  it('sends an empty feed to the feed filters', () => {
    render(
      <AuthContextProvider
        user={user}
        updateUser={jest.fn()}
        tokenRefreshed
        getRedirectUri={jest.fn()}
        loadingUser={false}
        loadedUserFromCache
      >
        <FeedEmptyScreen />
      </AuthContextProvider>,
    );

    expect(
      screen.getByText('Your feed filters are too specific.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Feed filters' })).toHaveAttribute(
      'href',
      'https://daily.dev/feeds/u1/edit',
    );
  });
});
