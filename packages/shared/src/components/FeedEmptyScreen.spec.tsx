import React from 'react';
import { render, screen } from '@testing-library/react';
import FeedEmptyScreen from './FeedEmptyScreen';
import { AuthContextProvider } from '../contexts/AuthContext';
import { ActiveFeedNameContext } from '../contexts/ActiveFeedNameContext';
import { SharedFeedPage } from './utilities/common';
import type { LoggedUser } from '../lib/user';
import type { AllFeedPages } from '../lib/query';

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

const renderComponent = (feedName: AllFeedPages) =>
  render(
    <AuthContextProvider
      user={user}
      updateUser={jest.fn()}
      tokenRefreshed
      getRedirectUri={jest.fn()}
      loadingUser={false}
      loadedUserFromCache
    >
      <ActiveFeedNameContext.Provider value={{ feedName }}>
        <FeedEmptyScreen />
      </ActiveFeedNameContext.Provider>
    </AuthContextProvider>,
  );

describe('FeedEmptyScreen', () => {
  it('sends the home feed to its feed settings', () => {
    renderComponent(SharedFeedPage.MyFeed);

    expect(
      screen.getByText('Your feed filters are too specific'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Feed settings' })).toHaveAttribute(
      'href',
      'https://daily.dev/feeds/u1/edit',
    );
  });

  it('tells other sorts there is nothing yet without an action', () => {
    renderComponent(SharedFeedPage.Popular);

    expect(screen.getByText('No posts for this sort yet')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
