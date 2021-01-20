import {
  CANCEL_UPVOTE_MUTATION,
  FeedData,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { ANONYMOUS_FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '../components/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import Feed from '../components/Feed';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import { LoginModalMode } from '../components/modals/LoginModal';

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
        <Feed query={ANONYMOUS_FEED_QUERY} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should add one placeholder when loading', async () => {
  renderComponent();
  expect(await screen.findByRole('article')).toHaveAttribute('aria-busy');
});

it('should replace placeholders with posts and ad', async () => {
  renderComponent();
  const links = defaultFeedPage.edges.map((edge) => edge.node.permalink);
  await waitFor(() => nock.isDone());
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toEqual(7);
    return elements.map((el, i) =>
      expect(el.querySelector('a')).toHaveAttribute('href', links[i]),
    );
  });
  await waitFor(async () => {
    const el = await screen.findByTestId('adItem');
    expect(el.querySelector('a')).toHaveAttribute('href', ad.link);
  });
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: UPVOTE_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByTitle('Upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should send cancel upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: CANCEL_UPVOTE_MUTATION,
        variables: { id: '618ca73c969187a24b29205216eec3bd' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByTitle('Remove upvote');
  el.click();
  await waitFor(() => mutationCalled);
});

it('should open login modal on anonymous upvote', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
      }),
    ],
    null,
  );
  const [el] = await screen.findAllByTitle('Upvote');
  el.click();
  expect(showLogin).toBeCalledWith(LoginModalMode.ContentQuality);
});
