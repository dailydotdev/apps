import { FeedData } from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { BOOKMARKS_FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import BookmarksPage from '../pages/bookmarks';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import SettingsContext, {
  SettingsContextData,
} from '../contexts/SettingsContext';
import OnboardingContext from '../contexts/OnboardingContext';

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
        replace: routerReplace,
      } as unknown) as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = BOOKMARKS_FEED_QUERY,
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
        <OnboardingContext.Provider
          value={{
            showWelcome: false,
            onboardingReady: true,
            setShowWelcome: jest.fn(),
            trackEngagement: jest.fn(),
            closeReferral: jest.fn(),
            showReferral: false,
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            <BookmarksPage />
          </SettingsContext.Provider>
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request bookmarks feed', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should redirect to home page when logged-out', async () => {
  renderComponent([], null);
  await waitFor(() => expect(routerReplace).toBeCalledWith('/'));
});

it('should show empty screen when feed is empty', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: {
        hasNextPage: false,
        endCursor: null,
      },
      edges: [],
    }),
  ]);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  expect(
    await screen.findByText('Your bookmark list is empty.'),
  ).toBeInTheDocument();
  await waitFor(() => {
    const elements = screen.queryAllByTestId('postItem');
    expect(elements.length).toBeFalsy();
  });
});
