import { FeedData } from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { ANONYMOUS_FEED_QUERY, FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import Recent from '../pages/recent';
import OnboardingContext from '../contexts/OnboardingContext';
import SettingsContext, {
  SettingsContextData,
} from '../contexts/SettingsContext';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
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
            {Recent.getLayout(<Recent />, {}, Recent.layoutProps)}
          </OnboardingContext.Provider>
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
      ranking: 'TIME',
      unreadOnly: false,
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
        ranking: 'TIME',
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
