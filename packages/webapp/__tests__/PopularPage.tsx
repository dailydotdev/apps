import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  ANONYMOUS_FEED_QUERY,
  RankingAlgorithm,
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
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { Alerts, UPDATE_ALERTS } from '@dailydotdev/shared/src/graphql/alerts';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { act } from 'preact/test-utils';
import {
  getFeedSettingsQueryKey,
  getHasAnyFilter,
} from '@dailydotdev/shared/src/hooks/useFeedSettings';
import {
  AllTagCategoriesData,
  FEED_SETTINGS_QUERY,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import Popular from '../pages/popular';

let client: QueryClient;
const showLogin = jest.fn();

beforeEach(() => {
  client = null;
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/popular',
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

const defaultAlerts: Alerts = { filter: true };
const updateAlerts = jest.fn();

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
  alerts = defaultAlerts,
): RenderResult => {
  client = new QueryClient();

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
        <AlertContextProvider
          alerts={alerts}
          updateAlerts={updateAlerts}
          loadedAlerts
        >
          <SettingsContext.Provider value={settingsContext}>
            {Popular.getLayout(<Popular />, {}, Popular.layoutProps)}
          </SettingsContext.Provider>
        </AlertContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

// now that we have the my feed to contain filtered feeds, the popular page always request for anonymous feed.
// it('should request user feed', async () => {
//   renderComponent([
//     createFeedMock(defaultFeedPage, FEED_QUERY, {
//       first: 7,
//       loggedIn: true,
//       unreadOnly: false,
//       version: 1,
//       ranking: RankingAlgorithm.Popularity,
//     }),
//   ]);
//   await waitFor(async () => {
//     const elements = await screen.findAllByTestId('postItem');
//     expect(elements.length).toBeTruthy();
//   });
// });

it('should request anonymous feed', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
        version: 1,
        ranking: RankingAlgorithm.Popularity,
      }),
    ],
    null,
  );
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

const createMockFeedSettings = () => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn: true } },
  result: { data: { feedSettings: { blockedTags: ['javascript'] } } },
});

it('should remove filter alert if the user has filters and opened feed filters', async () => {
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: { filter: false } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { _: true } };
    },
  });
  renderComponent([createFeedMock(), createMockFeedSettings()], defaultUser, {
    filter: true,
  });

  await act(async () => {
    const feedFilters = await screen.findByTestId('create_myfeed');
    feedFilters.click();
  });

  await waitFor(() => {
    const key = getFeedSettingsQueryKey(defaultUser);
    const data = client.getQueryData<AllTagCategoriesData>(key);
    expect(getHasAnyFilter(data.feedSettings)).toBeTruthy();
  });

  await act(() => new Promise((resolve) => setTimeout(resolve, 100)));

  expect(updateAlerts).toBeCalledWith({ filter: false });
  expect(mutationCalled).toBeTruthy();
});
