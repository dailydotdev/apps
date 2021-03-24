import {
  ADD_BOOKMARKS_MUTATION,
  Post,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import nock from 'nock';
import AuthContext from '../contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '../lib/user';
import SimilarPosts from '../components/SimilarPosts';
import { SIMILAR_POSTS_QUERY, SimilarPostsData } from '../graphql/similarPosts';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createFeedMock = (
  trendingPosts: Post[] = [{ ...defaultFeedPage.edges[0].node, trending: 50 }],
  similarPosts: Post[] = [
    defaultFeedPage.edges[2].node,
    defaultFeedPage.edges[3].node,
    defaultFeedPage.edges[4].node,
  ],
  variables: unknown = {
    post: 'p1',
    loggedIn: true,
    trendingFirst: 1,
    similarFirst: 3,
  },
): MockedGraphQLResponse<SimilarPostsData> => ({
  request: {
    query: SIMILAR_POSTS_QUERY,
    variables,
  },
  result: {
    data: {
      trendingPosts,
      similarPosts,
    },
  },
});

let queryClient: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  queryClient = new QueryClient();
  mocks.forEach(mockGraphQL);
  return render(
    <QueryClientProvider client={queryClient}>
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
        <SimilarPosts postId="p1" />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show placeholders when loading', async () => {
  renderComponent();
  const elements = await screen.findAllByRole('article');
  elements.map((el) => expect(el).toHaveAttribute('aria-busy'));
});

it('should show up to 3 articles', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(3);
});

it('should show up to 3 articles even when there are no trending articles', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(3);
});

it('should show trending info for trending posts', async () => {
  renderComponent();
  expect(await screen.findByText('Hot')).toBeInTheDocument();
  expect(
    await screen.findByText('50 devs read it last hour'),
  ).toBeInTheDocument();
});

it('should show number of upvotes and comments', async () => {
  renderComponent();
  expect(await screen.findByText('15 Comments')).toBeInTheDocument();
  expect(await screen.findByText('15 Comments')).toBeInTheDocument();
  expect(await screen.findAllByText('1 Upvotes')).toHaveLength(2);
});

it('should send add bookmark mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: ADD_BOOKMARKS_MUTATION,
        variables: { data: { postIds: ['4f354bb73009e4adfa5dbcbf9b3c4ebf'] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'true'));
});

it('should send remove bookmark mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock([
      { ...defaultFeedPage.edges[0].node, trending: 50, bookmarked: true },
    ]),
    {
      request: {
        query: REMOVE_BOOKMARK_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByLabelText('Remove bookmark');
  await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'true'));
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'false'));
});

it('should open login modal on anonymous bookmark', async () => {
  renderComponent(
    [
      createFeedMock(
        [{ ...defaultFeedPage.edges[0].node, trending: 50 }],
        [
          defaultFeedPage.edges[2].node,
          defaultFeedPage.edges[3].node,
          defaultFeedPage.edges[4].node,
        ],
        {
          post: 'p1',
          loggedIn: false,
          trendingFirst: 1,
          similarFirst: 3,
        },
      ),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  expect(showLogin).toBeCalledWith();
});
