import nock from 'nock';
import React from 'react';
import {
  findByRole,
  findByText,
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperationOptions } from 'subscriptions-transport-ws';
import { mocked } from 'ts-jest/utils';
import { useRouter } from 'next/router';

import {
  ADD_BOOKMARKS_MUTATION,
  FeedData,
  HIDE_POST_MUTATION,
  Post,
  POST_BY_ID_QUERY,
  PostData,
  PostsEngaged,
  REMOVE_BOOKMARK_MUTATION,
  REPORT_POST_MUTATION,
  PostType,
  UserVote,
} from '../graphql/posts';
import {
  completeActionMock,
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
import {
  AcquisitionChannel,
  USER_ACQUISITION_MUTATION,
  VOTE_MUTATION,
} from '../graphql/users';
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
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../hooks/useFeedSettings';
import Toast from './notifications/Toast';
import OnboardingContext from '../contexts/OnboardingContext';
import { LazyModalElement } from './modals/LazyModalElement';
import { AuthTriggers } from '../lib/auth';
import { SourceType } from '../graphql/sources';
import { acquisitionKey } from './cards/AcquisitionFormCard';
import { removeQueryParam } from '../lib/links';
import { SharedFeedPage } from './utilities';
import { AllFeedPages } from '../lib/query';
import { UserVoteEntity } from '../hooks';
import * as hooks from '../hooks/useViewSize';
import { ActionType, COMPLETE_ACTION_MUTATION } from '../graphql/actions';

const showLogin = jest.fn();
let nextCallback: (value: PostsEngaged) => unknown = null;

jest.mock('../hooks/useBookmarkProvider', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation((): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    })),
}));

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
  // is desktop
  jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
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
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
    },
  },
});

const mockCompleteAction = () =>
  mockGraphQL({
    request: {
      query: COMPLETE_ACTION_MUTATION,
      variables: { type: 'bookmark_promote_mobile' },
    },
    result: () => {
      return { data: {} };
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
  feedName: AllFeedPages = SharedFeedPage.MyFeed,
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
    toggleOptOutReadingStreak: jest.fn(),
    optOutReadingStreak: true,
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
          isLoggedIn: !!user,
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
              feedName={feedName}
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

  // eslint-disable-next-line no-restricted-syntax
  for (const el of elements) {
    // eslint-disable-next-line no-await-in-loop,@typescript-eslint/no-loop-func
    await waitFor(async () => {
      const links = await within(el).findAllByRole('link');
      expect(links[0]).toHaveAttribute('href');
    });
  }

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
        query: VOTE_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          vote: UserVote.Up,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
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
          node: {
            ...defaultFeedPage.edges[0].node,
            userState: {
              vote: UserVote.Up,
            },
          },
        },
      ],
    }),
    {
      request: {
        query: VOTE_MUTATION,
        variables: {
          id: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
          vote: UserVote.None,
          entity: UserVoteEntity.Post,
        },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
    completeActionMock({ action: ActionType.VotePost }),
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
  expect(showLogin).toBeCalledWith({ trigger: AuthTriggers.Upvote });
});

it('should send add bookmark mutation', async () => {
  let mutationCalled = false;
  mockCompleteAction();
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
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should send remove bookmark mutation', async () => {
  let mutationCalled = false;
  mockCompleteAction();
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
    completeActionMock({ action: ActionType.BookmarkPost }),
  ]);
  const [el] = await screen.findAllByLabelText('Remove bookmark');
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
  const [el] = await screen.findAllByLabelText('Bookmark');
  el.click();
  await waitFor(() =>
    expect(showLogin).toBeCalledWith({ trigger: AuthTriggers.Bookmark }),
  );
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
  fireEvent.click(menuBtn);
  const contextBtn = await screen.findByText('Report');
  fireEvent.click(contextBtn);
  const brokenLinkBtn = await screen.findByText('Broken link');
  fireEvent.click(brokenLinkBtn);
  const submitBtn = await screen.findByText('Submit report');
  fireEvent.click(submitBtn);

  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
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
  fireEvent.click(menuBtn);
  const contextBtn = await screen.findByText('Report');
  fireEvent.click(contextBtn);
  const brokenLinkBtn = await screen.findByText('Broken link');
  fireEvent.click(brokenLinkBtn);
  const input = (await screen.findByRole('textbox')) as HTMLTextAreaElement;
  fireEvent.change(input, { target: { value: 'comment' } });
  input.dispatchEvent(new Event('input', { bubbles: true }));
  const submitBtn = await screen.findByText('Submit report');
  fireEvent.click(submitBtn);

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
  fireEvent.click(menuBtn);
  const contextBtn = await screen.findByText('Report');
  fireEvent.click(contextBtn);
  const brokenLinkBtn = await screen.findByText('NSFW');
  fireEvent.click(brokenLinkBtn);

  await screen.findByTitle('Eminem Quotes Generator - Simple PHP RESTful API');

  const submitBtn = await screen.findByText('Submit report');
  fireEvent.click(submitBtn);

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
  fireEvent.click(menuBtn);
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

  const [menuBtn] = await screen.findAllByLabelText('Options');
  fireEvent.click(menuBtn);
  mockGraphQL(createTagsSettingsMock());
  await waitFor(async () => {
    const data = await queryClient.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const contextBtn = await screen.findByText("Don't show posts from Echo JS");
  fireEvent.click(contextBtn);

  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should unblock a source', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
    {
      request: {
        query: REMOVE_FILTERS_FROM_FEED_MUTATION,
        variables: { filters: { excludeSources: ['echojs'] } },
      },
      result: () => {
        mutationCalled = true;
        return { data: { _: true } };
      },
    },
  ]);
  const [menuBtn] = await screen.findAllByLabelText('Options');
  fireEvent.click(menuBtn);
  mockGraphQL(
    createTagsSettingsMock({
      includeTags: [],
      blockedTags: [],
      excludeSources: [
        {
          id: 'echojs',
          name: 'Echo JS',
          handle: 'echojs',
          image: 'https://s1.com/echojs.jpg',
          permalink: 'https://s1.com/echojs',
          type: SourceType.Machine,
          public: true,
        },
      ],
    }),
  );
  await waitFor(async () => {
    const data = await queryClient.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const contextBtn = await screen.findByText('Show posts from Echo JS');

  await waitFor(async () => {
    fireEvent.click(contextBtn);
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    const feed = screen.getByTestId('posts-feed');
    expect(feed).toHaveAttribute('aria-live', 'assertive');
  });

  await waitFor(() => expect(mutationCalled).toBeTruthy());
});

it('should block a tag', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock({
      pageInfo: defaultFeedPage.pageInfo,
      edges: [defaultFeedPage.edges[0]],
    }),
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

  const [menuBtn] = await screen.findAllByLabelText('Options');
  fireEvent.click(menuBtn);
  mockGraphQL(createTagsSettingsMock());
  await waitFor(async () => {
    const data = await queryClient.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  const contextBtn = await screen.findByText('Not interested in #javascript');
  fireEvent.click(contextBtn);

  await waitFor(() => expect(mutationCalled).toBeTruthy());
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

  await screen.findByTitle('Eminem Quotes Generator - Simple PHP RESTful API');

  const irrelevantTagsBtn = await screen.findByText('The post is not about...');
  fireEvent.click(irrelevantTagsBtn);
  const javascriptElements = await screen.findAllByText('#javascript');
  const javascriptBtn = javascriptElements.find(
    (item) => item.tagName === 'BUTTON',
  );
  fireEvent.click(javascriptBtn);
  const submitBtn = await screen.findByText('Submit report');
  fireEvent.click(submitBtn);

  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(() =>
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument(),
  );
});

describe('acquisition form card', () => {
  const replaceRouter = jest.fn();
  const url = new URL(`http://localhost:5002?${acquisitionKey}=true`);
  const mockedQuery = { [acquisitionKey]: 'true' };

  beforeEach(() => {
    /* eslint-disable @typescript-eslint/no-var-requires,global-require */
    mockedQuery[acquisitionKey] = 'true';
    mocked(useRouter).mockImplementation(() => ({
      route: '/',
      pathname: '',
      query: mockedQuery,
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      replace: replaceRouter,
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    }));

    Object.defineProperty(window, 'location', {
      value: url,
      configurable: true,
    });
  });

  it('should show the form card when the right url query param is present', async () => {
    renderComponent([createFeedMock()], defaultUser);
    await screen.findByTestId('acquisitionFormCard');
  });

  it('should hide the card once form is submitted', async () => {
    let mutationCalled = false;
    const { unmount } = renderComponent([createFeedMock()], defaultUser);

    const card = await screen.findByTestId('acquisitionFormCard');
    expect(card).toBeInTheDocument();

    const radio = await screen.findByLabelText('Other');
    fireEvent.click(radio);

    mockGraphQL({
      request: {
        query: USER_ACQUISITION_MUTATION,
        variables: { acquisitionChannel: 'other' },
      },
      result: () => {
        mutationCalled = true;
        return { data: { addUserAcquisitionChannel: { _: null } } };
      },
    });

    const submit = await screen.findByText('Submit');
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mutationCalled).toBeTruthy();
    });

    // set mocked query to false
    mockedQuery[acquisitionKey] = 'false';

    // rerender
    unmount();
    renderComponent([createFeedMock()], defaultUser);

    expect(screen.queryByTestId('acquisitionFormCard')).not.toBeInTheDocument();
  });

  it('should not show the card if the user dismissed it', async () => {
    renderComponent([createFeedMock()], defaultUser);
    const close = await screen.findByLabelText('Close acquisition form');
    fireEvent.click(close);

    await waitFor(() => {
      expect(replaceRouter).toHaveBeenCalledWith(
        removeQueryParam(url.toString(), acquisitionKey),
      );
    });

    const card = screen.queryByTestId('acquisitionFormCard');
    expect(card).not.toBeInTheDocument();
  });

  it('should not show the card if the user has submitted already', async () => {
    renderComponent([createFeedMock()], {
      ...defaultUser,
      acquisitionChannel: AcquisitionChannel.Friend,
    });

    const card = screen.queryByTestId('acquisitionFormCard');
    expect(card).not.toBeInTheDocument();
  });

  it('should not show the card if the feed is different than My Feed', async () => {
    renderComponent(undefined, undefined, SharedFeedPage.Popular);

    const card = screen.queryByTestId('acquisitionFormCard');
    expect(card).not.toBeInTheDocument();
  });
});
