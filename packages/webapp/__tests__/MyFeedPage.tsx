import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import {
  ANONYMOUS_FEED_QUERY,
  FEED_QUERY,
  OnboardingMode,
  RankingAlgorithm,
} from '@dailydotdev/shared/src/graphql/feed';
import FeaturesContext from '@dailydotdev/shared/src/contexts/FeaturesContext';
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
import { Alerts, UPDATE_ALERTS } from '@dailydotdev/shared/src/graphql/alerts';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { filterAlertMessage } from '@dailydotdev/shared/src/components/filters/FeedFilters';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import MyFeed from '../pages/my-feed';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

let defaultAlerts: Alerts = { filter: true };
const updateAlerts = jest.fn();
const showLogin = jest.fn();

beforeEach(() => {
  defaultAlerts = { filter: true };
  jest.restoreAllMocks();
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
let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
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
      <FeaturesContext.Provider
        value={{ flags: { my_feed_on: { enabled: true } } }}
      >
        <AlertContextProvider
          alerts={defaultAlerts}
          updateAlerts={updateAlerts}
          loadedAlerts
        >
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
              <OnboardingContext.Provider
                value={{
                  myFeedMode: OnboardingMode.Manual,
                  isOnboardingOpen: false,
                  onCloseOnboardingModal: jest.fn(),
                  onInitializeOnboarding: jest.fn(),
                  onShouldUpdateFilters: jest.fn(),
                }}
              >
                <NotificationsContextProvider>
                  {MyFeed.getLayout(<MyFeed />, {}, MyFeed.layoutProps)}
                </NotificationsContextProvider>
              </OnboardingContext.Provider>
            </SettingsContext.Provider>
          </AuthContext.Provider>
        </AlertContextProvider>
      </FeaturesContext.Provider>
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
      ranking: RankingAlgorithm.Popularity,
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

it('should show the created message if the user added filters', async () => {
  defaultAlerts = { filter: false, myFeed: 'created' };
  renderComponent();
  const section = await screen.findByText(filterAlertMessage);
  expect(section).toBeInTheDocument();
});

it('should not show the my feed alert if the user removed it', async () => {
  defaultAlerts = { filter: false, myFeed: null };
  renderComponent();
  await waitFor(() =>
    expect(screen.queryByText(filterAlertMessage)).not.toBeInTheDocument(),
  );
});

it('should remove the my feed alert if the user clicks the cross', async () => {
  let mutationCalled = false;
  mockGraphQL({
    request: {
      query: UPDATE_ALERTS,
      variables: { data: { myFeed: null } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { _: true } };
    },
  });
  defaultAlerts = { filter: false, myFeed: 'created' };
  renderComponent();

  const closeButton = await screen.findByTestId('alert-close');
  closeButton.click();

  await waitFor(() => {
    expect(updateAlerts).toBeCalledWith({ filter: false, myFeed: null });
    expect(mutationCalled).toBeTruthy();
  });
});
