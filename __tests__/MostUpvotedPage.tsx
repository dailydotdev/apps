import { FeedData } from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { MOST_UPVOTED_FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import Upvoted from '../pages/upvoted';
import OnboardingContext from '../contexts/OnboardingContext';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = MOST_UPVOTED_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
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
          }}
        >
          <Upvoted />
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request most upvoted feed when logged-in', async () => {
  renderComponent([
    createFeedMock(defaultFeedPage, MOST_UPVOTED_FEED_QUERY, {
      first: 7,
      loggedIn: true,
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request most upvoted feed when not', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, MOST_UPVOTED_FEED_QUERY, {
        first: 7,
        loggedIn: false,
      }),
    ],
    null,
  );
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});
