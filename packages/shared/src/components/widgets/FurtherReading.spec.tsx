import nock from 'nock';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthContext from '../../contexts/AuthContext';
import { LoggedUser } from '../../lib/user';
import {
  ADD_BOOKMARKS_MUTATION,
  Post,
  REMOVE_BOOKMARK_MUTATION,
} from '../../graphql/posts';
import {
  FURTHER_READING_QUERY,
  FurtherReadingData,
} from '../../graphql/furtherReading';
import defaultFeedPage from '../../../__tests__/fixture/feed';
import defaultUser from '../../../__tests__/fixture/loggedUser';
import FurtherReading from './FurtherReading';
import {
  completeActionMock,
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../../__tests__/helpers/graphql';
import { waitForNock } from '../../../__tests__/helpers/utilities';
import post from '../../../__tests__/fixture/post';
import { AuthTriggers } from '../../lib/auth';
import { ActionType } from '../../graphql/actions';

const showLogin = jest.fn();

jest.mock('../../hooks/useBookmarkProvider', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation((): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    })),
}));

beforeEach(() => {
  jest.restoreAllMocks();
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
  discussedPosts: Post[] = [
    defaultFeedPage.edges[1].node,
    defaultFeedPage.edges[5].node,
    defaultFeedPage.edges[6].node,
  ],
  variables: unknown = {
    post: post.id,
    loggedIn: true,
    trendingFirst: 1,
    similarFirst: 3,
    discussedFirst: 4,
    tags: post.tags,
    withDiscussedPosts: true,
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
  postUpdate?: Post,
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
        <FurtherReading currentPost={{ ...post, ...postUpdate }} />
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
  await waitForNock();
  const [el] = await screen.findAllByRole('article');
  await waitFor(() => expect(el).not.toHaveAttribute('aria-busy'));
  expect(await screen.findAllByRole('article')).toHaveLength(5);
});

it('should show articles even when there are no trending articles', async () => {
  renderComponent();
  await waitForNock();
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
  const [element1, element2] = await screen.findAllByTestId(
    'post-engagements-count',
  );
  expect(element1).toHaveTextContent('15 Comments');
  expect(element1).toHaveTextContent('1 Upvotes');
  expect(element2).toHaveTextContent('1 Upvotes');
});

it('should send add bookmark mutation', async () => {
  let mutationCalled = false;
  mockGraphQL(completeActionMock({ action: ActionType.BookmarkPromoteMobile }));
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
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'true'));
});

it('should send remove bookmark mutation', async () => {
  let mutationCalled = false;
  mockGraphQL(completeActionMock({ action: ActionType.BookmarkPromoteMobile }));
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
    completeActionMock({ action: ActionType.BookmarkPost }),
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
          post: post.id,
          loggedIn: false,
          trendingFirst: 1,
          similarFirst: 3,
          discussedFirst: 4,
          tags: post.tags,
          withDiscussedPosts: true,
        },
      ),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  expect(showLogin).toBeCalledWith({ trigger: AuthTriggers.Bookmark });
});

it('should not show table of contents when it does not exist', async () => {
  renderComponent();
  expect(screen.queryByText('Table of contents')).not.toBeInTheDocument();
});

it('should show table of contents when it exists', async () => {
  renderComponent([createFeedMock()], defaultUser, {
    ...post,
    toc: [{ text: 'Toc Item' }],
  });
  expect(screen.queryByText('Table of contents')).toBeInTheDocument();
});
