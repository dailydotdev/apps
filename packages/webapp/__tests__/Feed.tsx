import {
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  FeedData,
  HIDE_POST_MUTATION,
  PostsEngaged,
  REMOVE_BOOKMARK_MUTATION,
  REPORT_POST_MUTATION,
  UPVOTE_MUTATION,
} from '../graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { ANONYMOUS_FEED_QUERY } from '../graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import {
  findAllByRole,
  findByRole,
  findByText,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/preact';
import Feed from '../components/Feed';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { LoginModalMode } from '@dailydotdev/shared/src/types/LoginModalMode';
import { MyRankData } from '../graphql/users';
import { getRankQueryKey } from '@dailydotdev/shared/src/hooks/useReadingRank';
import { OperationOptions } from 'subscriptions-transport-ws';
import { SubscriptionCallbacks } from '@dailydotdev/shared/src/hooks/useSubscription';
import { COMMENT_ON_POST_MUTATION } from '../graphql/comments';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';

const showLogin = jest.fn();
let nextCallback: (value: PostsEngaged) => unknown = null;

jest.mock('@dailydotdev/shared/src/hooks/useSubscription', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (
        request: () => OperationOptions,
        { next }: SubscriptionCallbacks<PostsEngaged>,
      ): void => {
        nextCallback = next;
      },
    ),
}));

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

let queryClient: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  queryClient = new QueryClient();

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
            <Feed query={ANONYMOUS_FEED_QUERY} />
          </SettingsContext.Provider>
        </OnboardingContext.Provider>
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
  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toEqual(7);
  await Promise.all(
    elements.map(async (el, i) =>
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect((await findAllByRole(el, 'link'))[0]).toHaveAttribute(
        'href',
        links[i],
      ),
    ),
  );
  await waitFor(async () => {
    const el = await screen.findByTestId('adItem');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(await findByRole(el, 'link')).toHaveAttribute('href', ad.link);
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
  const [el] = await screen.findAllByLabelText('Upvote');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
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
  const [el] = await screen.findAllByLabelText('Remove upvote');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should open login modal on anonymous upvote', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
      }),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Upvote');
  el.click();
  expect(showLogin).toBeCalledWith(LoginModalMode.ContentQuality);
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
});

it('should send remove bookmark mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: REMOVE_BOOKMARK_MUTATION,
        variables: { id: '618ca73c969187a24b29205216eec3bd' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByLabelText('Remove bookmark');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should open login modal on anonymous bookmark', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
      }),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  expect(showLogin).toBeCalledWith();
});

it('should increase reading rank progress', async () => {
  renderComponent();
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 0 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: true,
        currentRank: 0,
        progressThisWeek: 1,
        lastReadTime: expect.anything(),
      },
    });
  });
});

it('should not increase reading rank progress when read today', async () => {
  renderComponent();
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: true, currentRank: 0, progressThisWeek: 0 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: { readToday: true, currentRank: 0, progressThisWeek: 0 },
    });
  });
});

it('should increase reading rank progress and rank', async () => {
  renderComponent();
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 2 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: true,
        currentRank: 1,
        progressThisWeek: 3,
        lastReadTime: expect.anything(),
      },
    });
  });
});

it('should not increase reading rank progress when reached final rank', async () => {
  renderComponent();
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 5, progressThisWeek: 7 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: { readToday: false, currentRank: 5, progressThisWeek: 7 },
    });
  });
});

it('should increase reading rank progress for anonymous users', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
      }),
    ],
    null,
  );
  const queryKey = getRankQueryKey(null);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 0 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: true,
        currentRank: 0,
        progressThisWeek: 1,
        lastReadTime: expect.anything(),
      },
    });
  });
});

it('should not increase reading rank progress for anonymous users after the first rank', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        unreadOnly: false,
      }),
    ],
    null,
  );
  const queryKey = getRankQueryKey(null);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 3 },
  });
  const el = await screen.findByTitle('Star night');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: false,
        currentRank: 0,
        progressThisWeek: 3,
      },
    });
  });
});

it('should update feed item on subscription message', async () => {
  renderComponent();
  await waitFor(() =>
    expect(screen.queryByTestId('adItem')).toBeInTheDocument(),
  );
  await waitFor(async () => {
    const [el] = await screen.findAllByLabelText('Upvote');
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    expect(await findByText(el.parentElement, '5')).toBeInTheDocument();
  });
  nextCallback({
    postsEngaged: {
      id: defaultFeedPage.edges[0].node.id,
      numUpvotes: 6,
      numComments: 7,
    },
  });
  await waitFor(async () => {
    const [el] = await screen.findAllByLabelText('Upvote');
    // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
    expect(await findByText(el.parentElement, '6')).toBeInTheDocument();
  });
});

it('should open comment popup on upvote', async () => {
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: UPVOTE_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
      },
      result: () => {
        return { data: { _: true } };
      },
    },
  ]);
  const [el] = await screen.findAllByLabelText('Upvote');
  el.click();
  await waitFor(async () =>
    expect(await screen.findByRole('textbox')).toBeInTheDocument(),
  );
});

it('should send comment through the comment popup', async () => {
  let mutationCalled = false;
  const newComment = {
    __typename: 'Comment',
    id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
    content: 'comment',
    createdAt: new Date(2017, 1, 10, 0, 1).toISOString(),
    permalink: 'https://daily.dev',
  };
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: UPVOTE_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
      },
      result: () => {
        return { data: { _: true } };
      },
    },
    {
      request: {
        query: COMMENT_ON_POST_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          content: 'comment',
        },
      },
      result: () => {
        mutationCalled = true;
        return {
          data: {
            comment: newComment,
          },
        };
      },
    },
  ]);
  const [upvoteBtn] = await screen.findAllByLabelText('Upvote');
  upvoteBtn.click();
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  input.value = 'comment';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const commentBtn = await screen.findByText('Comment');
  commentBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => expect(screen.queryByRole('textbox')).toBeFalsy());
});

it('should report broken link', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf', reason: 'BROKEN' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Report post');
  menuBtn.click();
  const contextBtn = await screen.findByText('Broken link');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
});

it('should report nsfw', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf', reason: 'NSFW' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Report post');
  menuBtn.click();
  const contextBtn = await screen.findByText('Report NSFW');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
});

it('should hide post', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    {
      request: {
        query: HIDE_POST_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Report post');
  menuBtn.click();
  const contextBtn = await screen.findByText('Hide post');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
});
