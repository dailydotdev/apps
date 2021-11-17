import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { BOOKMARKS_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter, useRouter } from 'next/router';
import { mocked } from 'ts-jest/utils';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import BookmarksPage from '../pages/bookmarks';
import ad from './fixture/ad';
import defaultUser from './fixture/loggedUser';
import defaultFeedPage from './fixture/feed';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { waitForNock } from './helpers/utilities';

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
      ({
        replace: routerReplace,
      } as unknown as NextRouter),
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
        <OnboardingContext.Provider
          value={{
            onboardingStep: 3,
            onboardingReady: true,
            incrementOnboardingStep: jest.fn(),
            trackEngagement: jest.fn(),
            closeReferral: jest.fn(),
            showReferral: false,
          }}
        >
          <SettingsContext.Provider value={settingsContext}>
            {BookmarksPage.getLayout(
              <BookmarksPage />,
              {},
              BookmarksPage.layoutProps,
            )}
          </SettingsContext.Provider>
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request bookmarks feed', async () => {
  renderComponent();
  await waitForNock();
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
  await waitForNock();
  expect(
    await screen.findByText('Your bookmark list is empty.'),
  ).toBeInTheDocument();
  await waitFor(() => {
    const elements = screen.queryAllByTestId('postItem');
    expect(elements.length).toBeFalsy();
  });
});

it('should set href to the search permalink', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const searchBtn = await screen.findByLabelText('Search bookmarks');
    expect(searchBtn).toHaveAttribute('href', '/bookmarks/search');
  });
});
