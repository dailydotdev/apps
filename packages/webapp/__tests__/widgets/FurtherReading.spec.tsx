import {
  ADD_BOOKMARKS_MUTATION,
  Post,
  REMOVE_BOOKMARK_MUTATION,
} from '@dailydotdev/shared/src/graphql/posts';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '@dailydotdev/shared/src/graphql/furtherReading';
import defaultFeedPage from '../fixture/feed';
import defaultUser from '../fixture/loggedUser';
import FurtherReading from '../../components/widgets/FurtherReading';
import { MockedGraphQLResponse, mockGraphQL } from '../helpers/graphql';

const showLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const defaultPost: Post = {
  id: 'p1',
  title: 'My post',
  createdAt: '2020-05-16T15:40:15.000Z',
  image:
    'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/870995e312adb17439eee1f9c353c7e0',
  placeholder:
    'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABAUH/8QAIRAAAgICAgEFAAAAAAAAAAAAAQMCEQASBAUxEyFRUpH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABoRAQACAwEAAAAAAAAAAAAAAAEAAgMR8CH/2gAMAwEAAhEDEQA/ANgZ2TUuetnJbGcWt0uEiFgk1f2vwPjLfXTcev425Zv6Ub2u7oecbyUrm1xmuEjLSyYg3R9vzHYFKIvsjxYks7e4n//Z',
  readTime: 0,
  source: {
    id: 'echojs',
    name: 'Echo JS',
    image:
      'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/echojs',
  },
  permalink: 'http://localhost:4000/r/p1',
  numComments: 1,
  numUpvotes: 5,
  commentsPermalink:
    'http://localhost:5002/posts/4f354bb73009e4adfa5dbcbf9b3c4ebf',
  tags: ['webdev', 'javascript'],
};

const createFeedMock = (
  trendingPosts: Post[] = [{ ...defaultFeedPage.edges[0].node, trending: 50 }],
  similarPosts: Post[] = [
    defaultFeedPage.edges[2].node,
    defaultFeedPage.edges[3].node,
    defaultFeedPage.edges[4].node,
  ],
  discussedPosts: Post[] = [
    defaultFeedPage.edges[1].node,
    defaultFeedPage.edges[5].node,
    defaultFeedPage.edges[6].node,
  ],
  variables: unknown = {
    post: 'p1',
    loggedIn: true,
    trendingFirst: 1,
    similarFirst: 3,
    discussedFirst: 4,
    tags: ['webdev', 'javascript'],
  },
): MockedGraphQLResponse<FurtherReadingData> => ({
  request: {
    query: FURTHER_READING_QUERY,
    variables,
  },
  result: {
    data: {
      trendingPosts,
      similarPosts,
      discussedPosts,
    },
  },
});

let queryClient: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
  post: Post = defaultPost,
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
          getRedirectUri: jest.fn(),
        }}
      >
        <FurtherReading currentPost={post} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should show placeholders when loading', async () => {
  renderComponent();
  const elements = await screen.findAllByRole('article');
  elements.map((el) => expect(el).toHaveAttribute('aria-busy'));
});

it('should show available articles', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(5);
});

it('should show articles even when there are no trending articles', async () => {
  renderComponent();
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(5);
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
        [
          defaultFeedPage.edges[1].node,
          defaultFeedPage.edges[5].node,
          defaultFeedPage.edges[6].node,
        ],
        {
          post: 'p1',
          loggedIn: false,
          trendingFirst: 1,
          similarFirst: 3,
          discussedFirst: 4,
          tags: ['webdev', 'javascript'],
        },
      ),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  expect(showLogin).toBeCalledWith('bookmark');
});

it('should not show table of contents when it does not exist', async () => {
  renderComponent();
  expect(screen.queryByText('Table of contents')).not.toBeInTheDocument();
});

it('should show table of contents when it exists', async () => {
  renderComponent([createFeedMock()], defaultUser, {
    ...defaultPost,
    toc: [{ text: 'Toc Item' }],
  });
  expect(screen.queryByText('Table of contents')).toBeInTheDocument();
});
