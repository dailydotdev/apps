import { FeedData } from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  SEARCH_POSTS_QUERY,
} from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import SearchPage from '../pages/search';
import { mocked } from 'ts-jest/utils';
import { NextRouter, useRouter } from 'next/router';
import OnboardingContext from '../contexts/OnboardingContext';
import SettingsContext, {
  SettingsContextData,
} from '../contexts/SettingsContext';

const showLogin = jest.fn();
const routerReplace = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      (({
        pathname: '/search',
        query: {},
        replace: routerReplace,
        push: jest.fn(),
      } as unknown) as NextRouter),
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
    toggleLightMode: jest.fn(),
    lightMode: false,
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
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
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <OnboardingContext.Provider
            value={{
              showWelcome: false,
              onboardingReady: true,
              setShowWelcome: jest.fn(),
            }}
          >
            {SearchPage.getLayout(<SearchPage />, {}, SearchPage.layoutProps)}
          </OnboardingContext.Provider>
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request user feed when query is empty and logged in', async () => {
  renderComponent([
    createFeedMock(defaultFeedPage, FEED_QUERY, {
      first: 7,
      loggedIn: true,
      unreadOnly: false,
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request anonymous feed when query is empty and not logged in', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
      }),
    ],
    null,
  );
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request search feed', async () => {
  const query = { q: 'daily' };
  mocked(useRouter).mockImplementation(
    () =>
      (({
        pathname: '/search',
        query,
      } as unknown) as NextRouter),
  );
  renderComponent([
    createFeedMock(defaultFeedPage, SEARCH_POSTS_QUERY, {
      first: 7,
      loggedIn: true,
      query: 'daily',
      unreadOnly: false,
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should update query param on enter', async (done) => {
  renderComponent([
    createFeedMock(defaultFeedPage, FEED_QUERY, {
      first: 7,
      loggedIn: true,
      unreadOnly: false,
    }),
  ]);
  const input = (await screen.findByRole('textbox')) as HTMLInputElement;
  input.value = 'daily';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  setTimeout(async () => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, keyCode: 13 }),
    );
    await waitFor(() =>
      expect(routerReplace).toBeCalledWith({
        pathname: '/search',
        query: { q: 'daily' },
      }),
    );
    done();
  }, 150);
});

it('should show empty screen on no results', async () => {
  const query = { q: 'daily' };
  mocked(useRouter).mockImplementation(
    () =>
      (({
        pathname: '/search',
        query,
      } as unknown) as NextRouter),
  );
  renderComponent([
    createFeedMock(
      {
        pageInfo: {
          hasNextPage: false,
          endCursor: null,
        },
        edges: [],
      },
      SEARCH_POSTS_QUERY,
      {
        first: 7,
        loggedIn: true,
        query: 'daily',
        unreadOnly: false,
      },
    ),
  ]);
  await waitFor(async () => {
    expect(await screen.findByText('No results found')).toBeInTheDocument();
  });
});
