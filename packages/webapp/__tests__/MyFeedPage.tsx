import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import MyFeed from '../pages/my-feed';
import ad from './fixture/ad';
import defaultUser from './fixture/loggedUser';
import defaultFeedPage from './fixture/feed';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/my-feed',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = ANONYMOUS_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    unreadOnly: false,
  },
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: 'dark',
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
  };
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          {MyFeed.getLayout(<MyFeed />, {}, MyFeed.layoutProps)}
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request user feed', async () => {
  renderComponent([
    createFeedMock(defaultFeedPage, FEED_QUERY, {
      first: 7,
      loggedIn: true,
      unreadOnly: false,
      version: 1,
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request anonymous feed', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
        version: 1,
      }),
    ],
    null,
  );
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});
