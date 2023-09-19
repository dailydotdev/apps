import nock from 'nock';
import React from 'react';
import {
  findAllByRole,
  findByRole,
  findByText,
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { OperationOptions } from 'subscriptions-transport-ws';
import {
  ADD_BOOKMARKS_MUTATION,
  CANCEL_UPVOTE_MUTATION,
  FeedData,
  HIDE_POST_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  PostsEngaged,
  REMOVE_BOOKMARK_MUTATION,
  REPORT_POST_MUTATION,
  UPVOTE_MUTATION,
  PostType,
} from '../graphql/posts';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import { ANONYMOUS_FEED_QUERY, OnboardingMode } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import Feed from './Feed';
import defaultFeedPage from '../../__tests__/fixture/feed';
import defaultUser from '../../__tests__/fixture/loggedUser';
import ad from '../../__tests__/fixture/ad';
import { LoggedUser } from '../lib/user';
import { MyRankData } from '../graphql/users';
import { getRankQueryKey } from '../hooks/useReadingRank';
import { SubscriptionCallbacks } from '../hooks/useSubscription';
import SettingsContext, {
  SettingsContextData,
  ThemeMode,
} from '../contexts/SettingsContext';
import { waitForNock } from '../../__tests__/helpers/utilities';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  AllTagCategoriesData,
  FEED_SETTINGS_QUERY,
  FeedSettings,
} from '../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../hooks/useFeedSettings';
import Toast from './notifications/Toast';
import OnboardingContext from '../contexts/OnboardingContext';
import { LazyModalElement } from './modals/LazyModalElement';
import { feature } from '../lib/featureManagement';
import { SearchExperiment } from '../lib/featureValues';

const showLogin = jest.fn();
let nextCallback: (value: PostsEngaged) => unknown = null;

jest.mock('../hooks/useSubscription', () => ({
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

let variables: unknown;
const defaultVariables = {
  first: 7,
  loggedIn: true,
};

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  variables = defaultVariables;
});

const originalScrollTo = window.scrollTo;

beforeAll(() => {
  window.scrollTo = jest.fn();
  feature.search.defaultValue = SearchExperiment.Control;
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
});

const createTagsSettingsMock = (
  feedSettings: FeedSettings = {
    includeTags: [],
    blockedTags: [],
    excludeSources: [],
  },
  loggedIn = true,
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn } },
  result: {
    data: {
      feedSettings,
    },
  },
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = ANONYMOUS_FEED_QUERY,
  params: unknown = variables,
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables: params,
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
  nock('http://localhost:3000').get('/v1/a?active=false').reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: ThemeMode.Dark,
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
    toggleSortingEnabled: jest.fn(),
    sortingEnabled: false,
    toggleOptOutWeeklyGoal: jest.fn(),
    optOutWeeklyGoal: true,
    sidebarExpanded: true,
    autoDismissNotifications: true,
    toggleAutoDismissNotifications: jest.fn(),
    updateCustomLinks: jest.fn(),
    toggleSidebarExpanded: jest.fn(),
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
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          trackingId: user?.id,
          loginState: null,
        }}
      >
        <LazyModalElement />
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
            <Toast autoDismissNotifications={false} />
            <Feed
              feedQueryKey={['feed']}
              query={ANONYMOUS_FEED_QUERY}
              variables={variables}
            />
          </OnboardingContext.Provider>
        </SettingsContext.Provider>
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
  await waitForNock();
  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toBeGreaterThan(0);
  await Promise.all(
    elements.map(async (el) =>
      // eslint-disable-next-line testing-library/prefer-screen-queries
      expect((await findAllByRole(el, 'link'))[0]).toHaveAttribute('href'),
    ),
  );
  await waitFor(async () => {
    const el = await screen.findByTestId('adItem');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    expect(await findByRole(el, 'link')).toHaveAttribute('href', ad.link);
  });
});

it('should render feed with sorting ranking by date', async () => {
  variables = { ...defaultVariables, ranking: 'TIME' };
  renderComponent(
    [createFeedMock(defaultFeedPage, ANONYMOUS_FEED_QUERY)],
    defaultUser,
  );
  await waitForNock();
  const elements = await screen.findAllByTestId('postItem');
  expect(elements.length).toBeGreaterThan(0);
  const [latest, old] = elements;
  // eslint-disable-next-line testing-library/no-node-access
  const latestTitle = latest.querySelector('button').getAttribute('title');
  const latestPost = defaultFeedPage.edges.find(
    (edge) => edge.node.title === latestTitle,
  ).node;
  // eslint-disable-next-line testing-library/no-node-access
  const oldTitle = old.querySelector('button').getAttribute('title');
  const oldPost = defaultFeedPage.edges.find(
    (edge) => edge.node.title === oldTitle,
  ).node;
  expect(new Date(latestPost.createdAt).getTime()).toBeGreaterThan(
    new Date(oldPost.createdAt).getTime(),
  );
});

it('should send upvote mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
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
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [
        {
          ...defaultFeedPage.edges[0],
          node: { ...defaultFeedPage.edges[0].node, upvoted: true },
        },
      ],
    }),
    {
      request: {
        query: CANCEL_UPVOTE_MUTATION,
        variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
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
      createFeedMock(
        {
          pageInfo: defaultFeedPage.pageInfo,
          edges: [defaultFeedPage.edges[0]],
        },
        ANONYMOUS_FEED_QUERY,
        {
          first: 7,
          loggedIn: false,
        },
      ),
    ],
    null,
  );
  const [el] = await screen.findAllByLabelText('Upvote');
  el.click();
  expect(showLogin).toBeCalledWith('upvote');
});

it('should send add bookmark mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [
        {
          ...defaultFeedPage.edges[0],
          node: { ...defaultFeedPage.edges[0].node, bookmarked: false },
        },
      ],
    }),
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
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const el = await screen.findByText('Save to bookmarks');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should send remove bookmark mutation', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [
        {
          ...defaultFeedPage.edges[0],
          node: { ...defaultFeedPage.edges[0].node, bookmarked: true },
        },
      ],
    }),
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
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const el = await screen.findByText('Remove from bookmarks');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should open login modal on anonymous bookmark', async () => {
  renderComponent(
    [
      createFeedMock(
        {
          pageInfo: defaultFeedPage.pageInfo,
          edges: [defaultFeedPage.edges[0]],
        },
        ANONYMOUS_FEED_QUERY,
        {
          first: 7,
          loggedIn: false,
        },
      ),
    ],
    null,
  );
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const el = await screen.findByText('Save to bookmarks');
  el.click();
  await waitFor(() => expect(showLogin).toBeCalledWith('bookmark'));
});

it('should increase reading rank progress', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [
        {
          ...defaultFeedPage.edges[0],
          node: {
            ...defaultFeedPage.edges[0].node,
            read: false,
          },
        },
      ],
    }),
  ]);
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 0 },
  });
  const main = await screen.findByTitle(
    'Eminem Quotes Generator - Simple PHP RESTful API',
  );
  // eslint-disable-next-line testing-library/no-node-access
  const el = await within(main.parentElement).findByText('Read post');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: true,
        currentRank: 1,
        progressThisWeek: 1,
        lastReadTime: expect.anything(),
        rankLastWeek: undefined,
      },
    });
    const state = queryClient.getQueryState(queryKey);
    expect(state.isInvalidated).toEqual(true);
  });
});

it('should not increase reading rank progress when read today', async () => {
  renderComponent();
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: true, currentRank: 0, progressThisWeek: 0 },
  });
  const el = await screen.findByTitle(
    'One Word Domains — Database of all available one-word domains',
  );
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: { readToday: true, currentRank: 0, progressThisWeek: 0 },
    });
  });
});

it('should increase reading rank progress and rank', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [
        {
          ...defaultFeedPage.edges[0],
          node: { ...defaultFeedPage.edges[0].node, read: false },
        },
      ],
    }),
  ]);
  const queryKey = getRankQueryKey(defaultUser);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 2 },
  });
  const main = await screen.findByTitle(
    'Eminem Quotes Generator - Simple PHP RESTful API',
  );
  // eslint-disable-next-line testing-library/no-node-access
  const el = await within(main.parentElement).findByText('Read post');
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
  const el = await screen.findByTitle(
    'One Word Domains — Database of all available one-word domains',
  );
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
      createFeedMock(
        {
          pageInfo: defaultFeedPage.pageInfo,
          edges: [
            {
              ...defaultFeedPage.edges[0],
              node: { ...defaultFeedPage.edges[0].node, read: false },
            },
          ],
        },
        ANONYMOUS_FEED_QUERY,
        {
          first: 7,
          loggedIn: false,
        },
      ),
    ],
    null,
  );
  const queryKey = getRankQueryKey(null);
  queryClient.setQueryData<MyRankData>(queryKey, {
    rank: { readToday: false, currentRank: 0, progressThisWeek: 0 },
  });
  const main = await screen.findByTitle(
    'Eminem Quotes Generator - Simple PHP RESTful API',
  );
  // eslint-disable-next-line testing-library/no-node-access
  const el = await within(main.parentElement).findByText('Read post');
  el.click();
  await waitFor(async () => {
    const data = await queryClient.getQueryData<MyRankData>(queryKey);
    expect(data).toEqual({
      rank: {
        readToday: true,
        currentRank: 1,
        progressThisWeek: 1,
        lastReadTime: expect.anything(),
      },
    });
  });
});

it('should update feed item on subscription message', async () => {
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
  ]);
  await screen.findByTestId('adItem');
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

it('should report broken link', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          reason: 'BROKEN',
          tags: [],
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText('Report');
  contextBtn.click();
  const brokenLinkBtn = await screen.findByText('Broken link');
  brokenLinkBtn.click();
  const submitBtn = await screen.findByText('Submit report');
  submitBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );

  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});

it('should report broken link with comment', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          reason: 'BROKEN',
          comment: 'comment',
          tags: [],
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText('Report');
  contextBtn.click();
  const brokenLinkBtn = await screen.findByText('Broken link');
  brokenLinkBtn.click();
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: 'comment' } });
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const submitBtn = await screen.findByText('Submit report');
  submitBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});

it('should report nsfw', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          reason: 'NSFW',
          tags: [],
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText('Report');
  contextBtn.click();
  const brokenLinkBtn = await screen.findByText('NSFW');
  brokenLinkBtn.click();
  const submitBtn = await screen.findByText('Submit report');
  submitBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );

  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});

it('should hide post', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
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
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText('Hide');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
});

it('should block a source', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    createTagsSettingsMock(),
    {
      request: {
        query: ADD_FILTERS_TO_FEED_MUTATION,
        variables: { filters: { excludeSources: ['echojs'] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  await waitFor(async () => {
    const data = await queryClient.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText("Don't show posts from Echo JS");
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());

  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});

it('should block a tag', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    createTagsSettingsMock(),
    {
      request: {
        query: ADD_FILTERS_TO_FEED_MUTATION,
        variables: { filters: { blockedTags: ['javascript'] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  await waitFor(async () => {
    const data = await queryClient.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const [menuBtn] = await screen.findAllByLabelText('Options');
  menuBtn.click();
  const contextBtn = await screen.findByText('Not interested in #javascript');
  contextBtn.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());

  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});

it('should open a modal to view post details', async () => {
  renderComponent();
  await waitForNock();
  const [first] = await screen.findAllByLabelText('Comments');
  fireEvent.click(first);
  await screen.findByRole('dialog');
});

const createPostMock = (
  data: Partial<Post> = {},
): MockedGraphQLResponse<PostData> => ({
  request: {
    query: POST_BY_ID_QUERY,
    variables: {
      id: data.id ?? '0e4005b2d3cf191f8c44c2718a457a1e',
    },
  },
  result: {
    data: {
      post: {
        id: '0e4005b2d3cf191f8c44c2718a457a1e',
        __typename: 'PostPage',
        title: 'Eminem Quotes Generator - Simple PHP RESTful API',
        summary: '',
        permalink: 'http://localhost:4000/r/9CuRpr5NiEY5',
        image:
          'https://res.cloudinary.com/daily-now/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
        createdAt: '2019-05-16T15:16:05.000Z',
        readTime: 8,
        tags: ['development', 'data-science', 'sql'],
        source: {
          __typename: 'Source',
          id: 's',
          name: 'Towards Data Science',
          handle: 's',
          permalink: 's',
          image:
            'https://res.cloudinary.com/daily-now/image/upload/t_logo,f_auto/v1/logos/tds',
        },
        upvoted: false,
        commented: false,
        bookmarked: false,
        commentsPermalink: 'https://localhost:5002/posts/9CuRpr5NiEY5',
        numUpvotes: 0,
        numComments: 0,
        type: PostType.Article,
        ...data,
      },
    },
  },
});

it('should be able to navigate through posts', async () => {
  const [firstPost, secondPost] = defaultFeedPage.edges;
  renderComponent();
  await waitForNock();

  mockGraphQL(createPostMock({ id: firstPost.node.id }));
  const [first] = await screen.findAllByLabelText('Comments');
  fireEvent.click(first);

  await screen.findByRole('dialog');
  const title = await screen.findByTestId('post-modal-title');
  expect(title).toHaveTextContent(firstPost.node.title);

  await screen.findByRole('navigation');
  const next = await screen.findByLabelText('Next');
  const params = { id: secondPost.node.id, title: secondPost.node.title };
  mockGraphQL(createPostMock(params));
  fireEvent.click(next);
  const secondTitle = await screen.findByTestId('post-modal-title');
  expect(secondTitle).toHaveTextContent(secondPost.node.title);

  await screen.findByRole('navigation');
  const previous = await screen.findByLabelText('Previous');
  mockGraphQL(createPostMock({ id: firstPost.node.id }));
  fireEvent.click(previous);
  const firstTitle = await screen.findByTestId('post-modal-title');
  expect(firstTitle).toHaveTextContent(firstPost.node.title);
});

it('should report irrelevant tags', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    {
      request: {
        query: REPORT_POST_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          reason: 'IRRELEVANT',
          tags: ['javascript'],
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Options');
  fireEvent.click(menuBtn);
  const contextBtn = await screen.findByText('Report');
  fireEvent.click(contextBtn);
  const irrelevantTagsBtn = await screen.findByText('The post is not about...');
  fireEvent.click(irrelevantTagsBtn);
  const javascriptBtn = await screen.findByText('#javascript');
  fireEvent.click(javascriptBtn);
  const submitBtn = await screen.findByText('Submit report');
  fireEvent.click(submitBtn);
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );

  await waitFor(async () => {
    await screen.findByRole('alert');
    const feed = await screen.findByTestId('posts-feed');

    return expect(feed).toHaveAttribute('aria-live', 'assertive');
  });
});
