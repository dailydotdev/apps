import nock from 'nock';
import React, { useState } from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  findByText,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';

import { GrowthBook, GrowthBookProvider } from '@growthbook/growthbook-react';
import type {
  Ad,
  FeedData,
  Post,
  PostData,
  PostsEngaged,
} from '../graphql/posts';
import {
  ADD_BOOKMARKS_MUTATION,
  HIDE_POST_MUTATION,
  POST_BY_ID_QUERY,
  REPORT_POST_MUTATION,
  PostType,
  UNHIDE_POST_MUTATION,
  UserVote,
  REMOVE_BOOKMARK_MUTATION,
} from '../graphql/posts';
import type { MockedGraphQLResponse } from '../../__tests__/helpers/graphql';
import {
  completeActionMock,
  mockGraphQL,
} from '../../__tests__/helpers/graphql';
import { settingsContext as baseSettingsContext } from '../../__tests__/helpers/boot';
import { ANONYMOUS_FEED_QUERY, FEED_V2_QUERY } from '../graphql/feed';
import AuthContext from '../contexts/AuthContext';
import Feed from './Feed';
import defaultFeedPage from '../../__tests__/fixture/feed';
import defaultUser from '../../__tests__/fixture/loggedUser';
import ad from '../../__tests__/fixture/ad';
import type { LoggedUser } from '../lib/user';
import {
  AcquisitionChannel,
  USER_ACQUISITION_MUTATION,
  VOTE_MUTATION,
} from '../graphql/users';
import type { SubscriptionCallbacks } from '../hooks/useSubscription';
import type { SettingsContextData } from '../contexts/SettingsContext';
import SettingsContext from '../contexts/SettingsContext';
import { waitForNock } from '../../__tests__/helpers/utilities';
import type {
  AllTagCategoriesData,
  FeedSettings,
} from '../graphql/feedSettings';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FEED_SETTINGS_QUERY,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '../graphql/feedSettings';
import { getFeedSettingsQueryKey } from '../hooks/useFeedSettings';
import Toast from './notifications/Toast';
import { LazyModalElement } from './modals/LazyModalElement';
import { AuthTriggers } from '../lib/auth';
import { SourceType } from '../graphql/sources';
import { removeQueryParam } from '../lib/links';
import { SharedFeedPage } from './utilities';
import type { AllFeedPages } from '../lib/query';
import { UserVoteEntity } from '../hooks';
import * as hooks from '../hooks/useViewSize';
import { ActionType } from '../graphql/actions';
import { acquisitionKey } from './cards/AcquisitionForm/common/common';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import FeedContext from '../contexts/FeedContext';
import type { FeedContextData } from '../contexts/FeedContext';
import { FeaturesReadyContext } from './GrowthBookProvider';
import {
  briefFeedEntrypointPage,
  featureHeroCards,
} from '../lib/featureManagement';
import type { Connection } from '../graphql/common';
import type { PostHero, PostHeroSignificance } from '../graphql/types';
import { useReadingReminderFeedHero } from '../hooks/notifications/useReadingReminderFeedHero';
import { useBoot } from '../hooks/useBoot';
import { MarketingCtaVariant } from './marketing/cta/common';
import type { MarketingCta } from './marketing/cta/common';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mocked(useRouter).mockImplementation(
  () =>
    ({
      pathname: '/',
      query: {},
    } as unknown as NextRouter),
);

const showLogin = jest.fn();
let nextCallback: ((value: PostsEngaged) => unknown) | undefined;

jest.mock('../hooks', () => {
  const originalModule = jest.requireActual('../hooks');
  return {
    __esModule: true,
    ...originalModule,
    useBookmarkProvider: (): { highlightBookmarkedPost: boolean } => ({
      highlightBookmarkedPost: false,
    }),
    useSubscription: {
      default: jest
        .fn()
        .mockImplementation(
          (
            request: () => null,
            { next }: SubscriptionCallbacks<PostsEngaged>,
          ): void => {
            if (next) {
              nextCallback = next;
            }
          },
        ),
    },
  };
});

jest.mock('../hooks/useSubscription', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (
        request: () => null,
        { next }: SubscriptionCallbacks<PostsEngaged>,
      ): void => {
        if (next) {
          nextCallback = next;
        }
      },
    ),
}));

// Default implementation returns the "hero hidden" state so existing tests
// are unaffected. Individual tests override it when they need to exercise
// the top hero render path.
jest.mock('../hooks/notifications/useReadingReminderFeedHero', () => ({
  useReadingReminderFeedHero: jest.fn().mockReturnValue({
    shouldShowTopHero: false,
    title: '',
    subtitle: '',
    onEnableHero: jest.fn(),
    onDismissHero: jest.fn(),
  }),
}));

jest.mock('../hooks/useBoot', () => ({
  useBoot: jest.fn().mockReturnValue({
    addSquad: jest.fn(),
    deleteSquad: jest.fn(),
    updateSquad: jest.fn(),
    getMarketingCta: jest.fn().mockReturnValue(null),
    clearMarketingCta: jest.fn(),
    getPlusEntryData: jest.fn().mockReturnValue(null),
  }),
}));

let variables: Record<string, unknown>;
const defaultVariables = {
  first: 7,
  loggedIn: true,
  after: '',
};

const queryClient = new QueryClient(defaultQueryClientTestingConfig);

beforeEach(() => {
  queryClient.clear();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  variables = defaultVariables;
  nextCallback = undefined;
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

const createFeedMock = (
  page = defaultFeedPage,
  query: string = ANONYMOUS_FEED_QUERY,
  params: Record<string, unknown> = variables,
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

function renderComponent(
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user?: LoggedUser,
  feedName: AllFeedPages = SharedFeedPage.MyFeed,
  query = ANONYMOUS_FEED_QUERY,
): RenderResult {
  const resolvedUser = arguments.length < 2 ? defaultUser : user;

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a?active=false').reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    ...baseSettingsContext,
    setTheme: jest.fn(),
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleInsaneMode: jest.fn(),
    toggleShowTopSites: jest.fn(),
    toggleSortingEnabled: jest.fn(),
    toggleOptOutReadingStreak: jest.fn(),
    toggleAutoDismissNotifications: jest.fn(),
    updateCustomLinks: jest.fn(),
    toggleSidebarExpanded: jest.fn(),
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: resolvedUser,
          isLoggedIn: !!resolvedUser,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          trackingId: resolvedUser?.id,
          loginState: undefined,
          isAuthReady: true,
        }}
      >
        <LazyModalElement />
        <SettingsContext.Provider value={settingsContext}>
          <Toast autoDismissNotifications={false} />
          <Feed
            feedQueryKey={['feed']}
            feedName={feedName}
            query={query}
            variables={variables}
          />
        </SettingsContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

const getRequiredValue = <T,>(
  value: T | null | undefined,
  message: string,
): T => {
  if (value == null) {
    throw new Error(message);
  }

  return value;
};

const getPostTitle = (post: Pick<Post, 'title'>, label: string): string =>
  getRequiredValue(post.title, `Expected ${label} post title`);

const getPostCreatedAt = (
  post: Pick<Post, 'createdAt'>,
  label: string,
): string =>
  getRequiredValue(post.createdAt, `Expected ${label} post createdAt`);

describe('Feed logged in', () => {
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
      const links = await within(el).findAllByRole('link');
      expect(links[0]).toHaveAttribute('href', ad.link);
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
    const latestLink = getRequiredValue(
      latest.querySelector('a'),
      'Expected latest post link',
    );
    const latestTitle = getRequiredValue(
      latestLink.getAttribute('title'),
      'Expected latest post title',
    );
    const latestPost = getRequiredValue(
      defaultFeedPage.edges.find((edge) => edge.node.title === latestTitle)
        ?.node,
      'Expected latest post in default feed',
    );
    // eslint-disable-next-line testing-library/no-node-access
    const oldLink = getRequiredValue(
      old.querySelector('a'),
      'Expected old post link',
    );
    const oldTitle = getRequiredValue(
      oldLink.getAttribute('title'),
      'Expected old post title',
    );
    const oldPost = getRequiredValue(
      defaultFeedPage.edges.find((edge) => edge.node.title === oldTitle)?.node,
      'Expected old post in default feed',
    );
    expect(
      new Date(getPostCreatedAt(latestPost, 'latest')).getTime(),
    ).toBeGreaterThan(new Date(getPostCreatedAt(oldPost, 'old')).getTime());
  });

  it('should render posts from feedV2 post items', async () => {
    renderComponent(
      [
        {
          request: {
            query: FEED_V2_QUERY,
            variables,
          },
          result: {
            data: {
              page: {
                pageInfo: defaultFeedPage.pageInfo,
                edges: defaultFeedPage.edges.map((edge) => ({
                  node: {
                    __typename: 'FeedPostItem',
                    post: edge.node,
                    feedMeta: edge.node.feedMeta ?? null,
                  },
                })),
              },
            },
          },
        },
      ],
      defaultUser,
      SharedFeedPage.MyFeed,
      FEED_V2_QUERY,
    );

    await waitForNock();
    expect(await screen.findAllByTestId('postItem')).not.toHaveLength(0);
  });

  it('should render feedV2 highlight items as cards', async () => {
    renderComponent(
      [
        {
          request: {
            query: FEED_V2_QUERY,
            variables,
          },
          result: {
            data: {
              page: {
                pageInfo: defaultFeedPage.pageInfo,
                edges: [
                  {
                    node: {
                      __typename: 'FeedHighlightsItem',
                      feedMeta: null,
                      highlights: [
                        {
                          id: 'highlight-1',
                          channel: 'agents',
                          headline: 'The first highlight',
                          highlightedAt: '2026-04-05T09:00:00.000Z',
                          post: {
                            id: defaultFeedPage.edges[0].node.id,
                            commentsPermalink:
                              defaultFeedPage.edges[0].node.commentsPermalink,
                          },
                        },
                        {
                          id: 'highlight-2',
                          channel: 'agents',
                          headline: 'The second highlight',
                          highlightedAt: '2026-04-05T08:00:00.000Z',
                          post: {
                            id: defaultFeedPage.edges[1].node.id,
                            commentsPermalink:
                              defaultFeedPage.edges[1].node.commentsPermalink,
                          },
                        },
                      ],
                    },
                  },
                  {
                    node: {
                      __typename: 'FeedPostItem',
                      post: defaultFeedPage.edges[0].node,
                      feedMeta: defaultFeedPage.edges[0].node.feedMeta ?? null,
                    },
                  },
                ],
              },
            },
          },
        },
      ],
      defaultUser,
      SharedFeedPage.MyFeed,
      FEED_V2_QUERY,
    );

    await waitForNock();
    expect(await screen.findByText('Happening Now')).toBeInTheDocument();
    expect(screen.getByText('The first highlight')).toBeInTheDocument();
    expect(screen.getByText('Read all')).toBeInTheDocument();
  });

  it('should keep feedV2 highlights in the response order', async () => {
    renderComponent(
      [
        {
          request: {
            query: FEED_V2_QUERY,
            variables,
          },
          result: {
            data: {
              page: {
                pageInfo: defaultFeedPage.pageInfo,
                edges: [
                  {
                    node: {
                      __typename: 'FeedPostItem',
                      post: defaultFeedPage.edges[0].node,
                      feedMeta: defaultFeedPage.edges[0].node.feedMeta ?? null,
                    },
                  },
                  {
                    node: {
                      __typename: 'FeedPostItem',
                      post: defaultFeedPage.edges[1].node,
                      feedMeta: defaultFeedPage.edges[1].node.feedMeta ?? null,
                    },
                  },
                  {
                    node: {
                      __typename: 'FeedHighlightsItem',
                      feedMeta: null,
                      highlights: [
                        {
                          id: 'highlight-1',
                          channel: 'agents',
                          headline: 'The first highlight',
                          highlightedAt: '2026-04-05T09:00:00.000Z',
                          post: {
                            id: defaultFeedPage.edges[0].node.id,
                            commentsPermalink:
                              defaultFeedPage.edges[0].node.commentsPermalink,
                          },
                        },
                      ],
                    },
                  },
                  {
                    node: {
                      __typename: 'FeedPostItem',
                      post: defaultFeedPage.edges[2].node,
                      feedMeta: defaultFeedPage.edges[2].node.feedMeta ?? null,
                    },
                  },
                ],
              },
            },
          },
        },
      ],
      defaultUser,
      SharedFeedPage.MyFeed,
      FEED_V2_QUERY,
    );

    await waitForNock();

    const orderedItems = await screen.findAllByTestId(/postItem|highlightItem/);

    expect(
      orderedItems.map((item) => item.getAttribute('data-testid')),
    ).toEqual(['postItem', 'postItem', 'highlightItem', 'postItem']);
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
    const [el] = await screen.findAllByLabelText('More like this');
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
          variables: {
            data: { postIds: ['4f354bb73009e4adfa5dbcbf9b3c4ebf'] },
          },
        },
        result: () => {
          mutationCalled = true;
          return { data: { _: true } };
        },
      },
      completeActionMock({ action: ActionType.BookmarkPost }),
    ]);
    const [el] = await screen.findAllByLabelText('Bookmark');
    fireEvent.click(el);
    await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'true'));
    await waitForNock();
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
      completeActionMock({ action: ActionType.BookmarkPost }),
    ]);
    const [el] = await screen.findAllByLabelText('Remove bookmark');
    fireEvent.click(el);
    await waitFor(() => expect(el).toHaveAttribute('aria-pressed', 'true'));
    await waitForNock();
    await waitFor(() => expect(mutationCalled).toBeTruthy());
  });

  it('should update feed item on subscription message', async () => {
    renderComponent([
      createFeedMock({
        pageInfo: defaultFeedPage.pageInfo,
        edges: [defaultFeedPage.edges[0]],
      }),
    ]);
    await waitFor(async () => {
      const [el] = await screen.findAllByLabelText('More like this');
      const parent = getRequiredValue(
        el.parentElement,
        'Expected upvote button parent element',
      );
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      expect(await findByText(parent, '5')).toBeInTheDocument();
    });
    getRequiredValue(
      nextCallback,
      'Expected feed subscription callback',
    )({
      postsEngaged: {
        id: defaultFeedPage.edges[0].node.id,
        numUpvotes: 6,
        numComments: 7,
      },
    });
    await waitFor(async () => {
      const [el] = await screen.findAllByLabelText('More like this');
      const parent = getRequiredValue(
        el.parentElement,
        'Expected upvote button parent element after subscription',
      );
      // eslint-disable-next-line testing-library/no-node-access, testing-library/prefer-screen-queries
      expect(await findByText(parent, '6')).toBeInTheDocument();
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

    const menuBtn = await screen.findByLabelText('Options');
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });

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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    const contextBtn = await screen.findByText('Report');
    fireEvent.click(contextBtn);
    const brokenLinkBtn = await screen.findByText(
      'Inappropriate, explicit, or NSFW',
    );
    fireEvent.click(brokenLinkBtn);

    await screen.findByTitle(
      'Eminem Quotes Generator - Simple PHP RESTful API',
    );

    const submitBtn = await screen.findByText('Submit report');
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mutationCalled).toBeTruthy());
    await waitFor(() =>
      expect(
        screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
      ).not.toBeInTheDocument(),
    );
  });

  it('should hide post and replace card with the hidden feedback panel', async () => {
    let hideCalled = false;
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
          hideCalled = true;
          return { data: { _: true } };
        },
      },
    ]);
    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    const contextBtn = await screen.findByText('Hide');
    contextBtn.click();
    await waitFor(() => expect(hideCalled).toBeTruthy());
    expect(
      await screen.findByText("Got it. You'll see less like this."),
    ).toBeInTheDocument();
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument();
  });

  it('should restore the post when clicking Undo on the hidden feedback panel', async () => {
    let unhideCalled = false;
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
        result: () => ({ data: { _: true } }),
      },
      {
        request: {
          query: UNHIDE_POST_MUTATION,
          variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
        },
        result: () => {
          unhideCalled = true;
          return { data: { _: true } };
        },
      },
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, { key: ' ' });
    (await screen.findByText('Hide')).click();
    const undoBtn = await screen.findByRole('button', { name: 'Undo' });
    fireEvent.click(undoBtn);

    await waitFor(() => expect(unhideCalled).toBeTruthy());
    await waitFor(() =>
      expect(
        screen.queryByText("Got it. You'll see less like this."),
      ).not.toBeInTheDocument(),
    );
    expect(
      await screen.findByTitle(
        'Eminem Quotes Generator - Simple PHP RESTful API',
      ),
    ).toBeInTheDocument();
  });

  it('should remove the post from the feed when dismissing the hidden feedback panel', async () => {
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
        result: () => ({ data: { _: true } }),
      },
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, { key: ' ' });
    (await screen.findByText('Hide')).click();

    const closeBtn = await screen.findByTestId('postHiddenPanelClose');
    fireEvent.click(closeBtn);

    await waitFor(() =>
      expect(
        screen.queryByText("Got it. You'll see less like this."),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument();
  });

  it('should keep the Done button disabled until something is selected', async () => {
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
        result: () => ({ data: { _: true } }),
      },
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, { key: ' ' });
    (await screen.findByText('Hide')).click();

    const doneBtn = await screen.findByTestId('postHiddenPanelDone');
    expect(doneBtn).toBeDisabled();

    fireEvent.click(await screen.findByTestId('hideBlockSourceButton'));
    expect(doneBtn).not.toBeDisabled();
  });

  it('should batch source + tags into a single submit and show a toast with Undo', async () => {
    let blockTagCalled = false;
    let blockSourceCalled = false;
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
        result: () => ({ data: { _: true } }),
      },
      {
        request: {
          query: ADD_FILTERS_TO_FEED_MUTATION,
          variables: { filters: { blockedTags: ['javascript'] } },
        },
        result: () => {
          blockTagCalled = true;
          return { data: { _: true } };
        },
      },
      {
        request: {
          query: ADD_FILTERS_TO_FEED_MUTATION,
          variables: { filters: { excludeSources: ['echojs'] } },
        },
        result: () => {
          blockSourceCalled = true;
          return { data: { _: true } };
        },
      },
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, { key: ' ' });
    mockGraphQL(createTagsSettingsMock());
    await waitFor(async () => {
      const data = await queryClient.getQueryData(
        getFeedSettingsQueryKey(defaultUser),
      );
      expect(data).toBeTruthy();
    });
    (await screen.findByText('Hide')).click();

    fireEvent.click(await screen.findByTestId('hideBlockSourceButton'));
    fireEvent.click(await screen.findByTestId('hideBlockTagButton'));
    fireEvent.click(await screen.findByTestId('postHiddenPanelDone'));

    await waitFor(() => expect(blockTagCalled).toBeTruthy());
    await waitFor(() => expect(blockSourceCalled).toBeTruthy());

    expect(
      await screen.findByText('Unfollowed Echo JS and blocked #javascript'),
    ).toBeInTheDocument();
    const toastUndo = await screen.findByRole('button', { name: 'Undo' });
    expect(toastUndo).toBeInTheDocument();
    expect(
      screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
    ).not.toBeInTheDocument();
  });

  it('should restore post and unblock when clicking Undo on the success toast', async () => {
    let unhideCalled = false;
    let unblockTagCalled = false;
    let unblockSourceCalled = false;
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
        result: () => ({ data: { _: true } }),
      },
      {
        request: {
          query: ADD_FILTERS_TO_FEED_MUTATION,
          variables: { filters: { blockedTags: ['javascript'] } },
        },
        result: () => ({ data: { _: true } }),
      },
      {
        request: {
          query: ADD_FILTERS_TO_FEED_MUTATION,
          variables: { filters: { excludeSources: ['echojs'] } },
        },
        result: () => ({ data: { _: true } }),
      },
      {
        request: {
          query: UNHIDE_POST_MUTATION,
          variables: { id: '4f354bb73009e4adfa5dbcbf9b3c4ebf' },
        },
        result: () => {
          unhideCalled = true;
          return { data: { _: true } };
        },
      },
      {
        request: {
          query: REMOVE_FILTERS_FROM_FEED_MUTATION,
          variables: { filters: { blockedTags: ['javascript'] } },
        },
        result: () => {
          unblockTagCalled = true;
          return { data: { _: true } };
        },
      },
      {
        request: {
          query: REMOVE_FILTERS_FROM_FEED_MUTATION,
          variables: { filters: { excludeSources: ['echojs'] } },
        },
        result: () => {
          unblockSourceCalled = true;
          return { data: { _: true } };
        },
      },
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, { key: ' ' });
    mockGraphQL(createTagsSettingsMock());
    await waitFor(async () => {
      const data = await queryClient.getQueryData(
        getFeedSettingsQueryKey(defaultUser),
      );
      expect(data).toBeTruthy();
    });
    (await screen.findByText('Hide')).click();

    fireEvent.click(await screen.findByTestId('hideBlockSourceButton'));
    fireEvent.click(await screen.findByTestId('hideBlockTagButton'));
    fireEvent.click(await screen.findByTestId('postHiddenPanelDone'));

    await waitFor(() =>
      expect(
        screen.queryByText("Got it. You'll see less like this."),
      ).not.toBeInTheDocument(),
    );

    const toastAlert = await screen.findByRole('alert');
    const toastUndo = await within(toastAlert).findByRole('button', {
      name: 'Undo',
    });
    fireEvent.click(toastUndo);

    await waitFor(() => expect(unhideCalled).toBeTruthy());
    await waitFor(() => expect(unblockTagCalled).toBeTruthy());
    await waitFor(() => expect(unblockSourceCalled).toBeTruthy());
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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    mockGraphQL(createTagsSettingsMock());
    await waitFor(async () => {
      const data = await queryClient.getQueryData(
        getFeedSettingsQueryKey(defaultUser),
      );
      expect(data).toBeTruthy();
    });
    const contextBtn = await screen.findByText('Block Echo JS');
    fireEvent.click(contextBtn);
    await waitForNock();
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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
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
    const contextBtn = await screen.findByText('Unblock Echo JS');
    fireEvent.click(contextBtn);

    await waitFor(async () => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      const feed = screen.getByTestId('posts-feed');
      expect(feed).toHaveAttribute('aria-live', 'assertive');
    });

    await waitForNock();
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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    mockGraphQL(createTagsSettingsMock());
    await waitFor(async () => {
      const data = await queryClient.getQueryData(
        getFeedSettingsQueryKey(defaultUser),
      );
      expect(data).toBeTruthy();
    });
    const contextBtn = await screen.findByText('Block #javascript');
    fireEvent.click(contextBtn);

    await waitForNock();
    await waitFor(() => expect(mutationCalled).toBeTruthy());
  });

  it('should open a modal to view post details', async () => {
    jest.mocked(useRouter).mockImplementation(() => ({
      route: '/',
      pathname: '/',
      query: {
        pmid: '4f354bb73009e4adfa5dbcbf9b3c4ebf',
        pmcid: 'my-feed',
      },
      asPath: '/posts/4f354bb73009e4adfa5dbcbf9b3c4ebf',
      push: jest.fn(),
      replace: jest.fn(),
      basePath: '',
      isLocaleDomain: true,
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      isFallback: false,
      isReady: true,
      isPreview: false,
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }));

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
            'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/22fc3ac5cc3fedf281b6e4b46e8c0ba2',
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
              'https://media.daily.dev/image/upload/t_logo,f_auto/v1/logos/tds',
            type: SourceType.Machine,
            public: true,
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
    jest.mocked(useRouter).mockImplementation(() => {
      const [id, setId] = useState('4f354bb73009e4adfa5dbcbf9b3c4ebf');

      return {
        route: '/',
        pathname: '/',
        query: {
          pmid: id,
          pmcid: 'my-feed',
        },
        asPath: `/posts/${id}`,
        push: async (url, asUrl) => {
          if (!asUrl) {
            return true;
          }

          const pathname = typeof asUrl === 'string' ? asUrl : asUrl?.pathname;

          if (!pathname?.startsWith('/posts/')) {
            return true;
          }

          const newId = pathname.split('/posts/').pop();

          if (newId) {
            setId(newId);
          }

          return true;
        },
        replace: jest.fn(),
        basePath: '',
        isLocaleDomain: true,
        prefetch: jest.fn(),
        beforePopState: jest.fn(),
        reload: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        isFallback: false,
        isReady: true,
        isPreview: false,
        events: {
          on: jest.fn(),
          off: jest.fn(),
          emit: jest.fn(),
        },
      };
    });

    const [firstPost, secondPost] = defaultFeedPage.edges;
    renderComponent();
    await waitForNock();

    mockGraphQL(createPostMock({ id: firstPost.node.id }));
    const [first] = await screen.findAllByLabelText('Comments');
    fireEvent.click(first);

    await screen.findByRole('dialog');
    const title = await screen.findByTestId('post-modal-title');
    expect(title).toHaveTextContent(getPostTitle(firstPost.node, 'first'));

    await screen.findAllByRole('navigation');
    const next = await screen.findByLabelText('Next');
    const params = { id: secondPost.node.id, title: secondPost.node.title };
    mockGraphQL(createPostMock(params));
    fireEvent.click(next);
    const secondTitle = await screen.findByTestId('post-modal-title');
    expect(secondTitle).toHaveTextContent(
      getPostTitle(secondPost.node, 'second'),
    );

    await screen.findAllByRole('navigation');
    const previous = await screen.findByLabelText('Previous');
    mockGraphQL(createPostMock({ id: firstPost.node.id }));
    fireEvent.click(previous);
    const firstTitle = await screen.findByTestId('post-modal-title');
    expect(firstTitle).toHaveTextContent(getPostTitle(firstPost.node, 'first'));
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
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    const contextBtn = await screen.findByText('Report');
    fireEvent.click(contextBtn);

    await screen.findByTitle(
      'Eminem Quotes Generator - Simple PHP RESTful API',
    );

    const irrelevantTagsBtn = await screen.findByText(
      'Off-topic or wrong tags',
    );
    fireEvent.click(irrelevantTagsBtn);
    const submitBtn = await screen.findByRole('button', {
      name: 'Submit report',
    });
    expect(submitBtn).toBeDisabled();
    const javascriptBtn = await screen.findByRole('button', {
      name: '#javascript',
    });
    fireEvent.click(javascriptBtn);
    expect(submitBtn).toBeEnabled();
    fireEvent.click(submitBtn);

    await waitFor(() => expect(mutationCalled).toBeTruthy());
    await waitFor(() =>
      expect(
        screen.queryByTitle('Eminem Quotes Generator - Simple PHP RESTful API'),
      ).not.toBeInTheDocument(),
    );
  });

  it('should keep selected irrelevant tags when reason changes', async () => {
    renderComponent([
      createFeedMock({
        pageInfo: defaultFeedPage.pageInfo,
        edges: [defaultFeedPage.edges[0]],
      }),
    ]);

    const [menuBtn] = await screen.findAllByLabelText('Options');
    fireEvent.keyDown(menuBtn, {
      key: ' ',
    });
    const contextBtn = await screen.findByText('Report');
    fireEvent.click(contextBtn);

    const irrelevantTagsBtn = await screen.findByText(
      'Off-topic or wrong tags',
    );
    fireEvent.click(irrelevantTagsBtn);
    const submitBtn = await screen.findByRole('button', {
      name: 'Submit report',
    });
    const javascriptBtn = await screen.findByRole('button', {
      name: '#javascript',
    });
    fireEvent.click(javascriptBtn);
    expect(submitBtn).toBeEnabled();

    const brokenLinkBtn = await screen.findByText('Broken link');
    fireEvent.click(brokenLinkBtn);
    expect(submitBtn).toBeEnabled();

    fireEvent.click(irrelevantTagsBtn);
    expect(submitBtn).toBeEnabled();
  });

  describe('acquisition form card', () => {
    const replaceRouter = jest.fn();
    const url = new URL(`http://localhost:5002?${acquisitionKey}=true`);
    const mockedQuery = { [acquisitionKey]: 'true' };

    beforeEach(() => {
      /* eslint-disable @typescript-eslint/no-var-requires,global-require */
      mockedQuery[acquisitionKey] = 'true';
      jest.mocked(useRouter).mockImplementation(
        () =>
          ({
            route: '/',
            pathname: '',
            query: mockedQuery,
            asPath: '',
            push: jest.fn(),
            replace: replaceRouter,
            prefetch: jest.fn(() => Promise.resolve()),
            beforePopState: jest.fn(),
            basePath: '',
            isLocaleDomain: false,
            reload: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            isFallback: false,
            isReady: true,
            isPreview: false,
            events: {
              on: jest.fn(),
              off: jest.fn(),
              emit: jest.fn(),
            },
          } as unknown as NextRouter),
      );

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

      expect(
        screen.queryByTestId('acquisitionFormCard'),
      ).not.toBeInTheDocument();
    });

    it('should not show the card if the user dismissed it', async () => {
      const { unmount } = renderComponent([createFeedMock()], defaultUser);
      const close = await screen.findByLabelText('Close acquisition form');
      fireEvent.click(close);

      await waitFor(() => {
        expect(replaceRouter).toHaveBeenCalledWith(
          removeQueryParam(url.toString(), acquisitionKey),
        );
      });

      // set mocked query to false
      mockedQuery[acquisitionKey] = 'false';

      // rerender
      unmount();
      renderComponent([createFeedMock()], defaultUser);

      expect(
        screen.queryByTestId('acquisitionFormCard'),
      ).not.toBeInTheDocument();
    });

    it('should not show the card if the user has submitted already', async () => {
      renderComponent([createFeedMock()], {
        ...defaultUser,
        acquisitionChannel: AcquisitionChannel.Friend,
      });

      const card = screen.queryByTestId('acquisitionFormCard');
      expect(card).not.toBeInTheDocument();
    });

    it('should not show the card if the feed is different than For You', async () => {
      renderComponent(undefined, undefined, SharedFeedPage.Popular);

      const card = screen.queryByTestId('acquisitionFormCard');
      expect(card).not.toBeInTheDocument();
    });
  });
});

describe('Feed annonymous', () => {
  it('should open login modal on anonymous upvote', async () => {
    variables = {
      first: 7,
      loggedIn: false,
      after: '',
    };

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
            after: '',
          },
        ),
      ],
      undefined,
    );
    const [el] = await screen.findAllByLabelText('More like this');
    el.click();
    expect(showLogin).toBeCalledWith({ trigger: AuthTriggers.Upvote });
  });

  it('should open login modal on anonymous bookmark', async () => {
    variables = {
      first: 7,
      loggedIn: false,
      after: '',
    };

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
            after: '',
          },
        ),
      ],
      undefined,
    );
    const [el] = await screen.findAllByLabelText('Bookmark');
    el.click();
    await waitFor(() =>
      expect(showLogin).toBeCalledWith({ trigger: AuthTriggers.Bookmark }),
    );
  });
});

const sourceFixture = defaultFeedPage.edges[0].node.source;

const buildPost = (id: string, hero?: PostHero | null): Post =>
  ({
    id,
    title: `Post ${id}`,
    createdAt: '2026-05-25T00:00:00.000Z',
    image: 'https://daily.dev/img.png',
    readTime: 1,
    source: sourceFixture,
    tags: [],
    permalink: `http://localhost:4000/r/${id}`,
    numComments: 0,
    numUpvotes: 0,
    commentsPermalink: `http://localhost:5002/posts/${id}`,
    read: false,
    upvoted: false,
    commented: false,
    type: PostType.Article,
    domain: 'example.com',
    hero: hero ?? null,
  } as Post);

const SIGNIFICANCE_BY_SIZE: Record<number, PostHeroSignificance> = {
  4: 'breaking',
  3: 'major',
  2: 'notable',
  1: 'routine',
};

const buildWidePost = (id: string, size: number): Post =>
  buildPost(id, {
    id: `hero-${id}`,
    headline: 'wide',
    significance: SIGNIFICANCE_BY_SIZE[size] ?? 'notable',
    size,
    highlightedAt: '2026-05-25T00:00:00.000Z',
  });

const buildFeedPage = (posts: Post[]): Connection<Post> => ({
  pageInfo: { hasNextPage: false, endCursor: '' },
  edges: posts.map((node) => ({ node })),
});

interface HighlightLayoutRenderParams {
  posts: Post[];
  highlightEnabled: boolean;
  numCards?: number;
  pageSize?: number;
  adStart?: number;
  adRepeat?: number;
  minSpacing?: number;
  startIndex?: number;
  briefBannerPage?: number;
  staticAd?: { ad: Ad; index: number };
  disableAds?: boolean;
  user?: LoggedUser;
}

const renderWithHighlightLayout = ({
  posts,
  highlightEnabled,
  numCards = 4,
  pageSize = 25,
  adStart = 4,
  adRepeat = 8,
  minSpacing = 5,
  startIndex = 0,
  briefBannerPage,
  staticAd,
  disableAds,
  user = defaultUser,
}: HighlightLayoutRenderParams): RenderResult => {
  variables = { ...defaultVariables, first: pageSize };
  mockGraphQL(createFeedMock(buildFeedPage(posts)));
  // First ad page uses active=false, subsequent pages use active=true. Mock
  // both up to a handful of refills so multi-ad scenarios don't run dry.
  nock('http://localhost:3000').get('/v1/a?active=false').reply(200, [ad]);
  nock('http://localhost:3000')
    .get('/v1/a?active=true')
    .times(10)
    .reply(200, [ad]);

  const feedContextValue: FeedContextData = {
    pageSize,
    numCards: {
      eco: numCards,
      roomy: numCards,
      cozy: numCards,
    } as FeedContextData['numCards'],
    adTemplate: { adStart, adRepeat },
  };

  const gb = new GrowthBook();
  gb.setFeatures({
    [featureHeroCards.id]: {
      defaultValue: {
        enabled: highlightEnabled,
        minSpacing,
        startIndex,
        chipLabels: {},
      },
    },
    ...(briefBannerPage
      ? {
          [briefFeedEntrypointPage.id]: {
            defaultValue: briefBannerPage,
          },
        }
      : {}),
  });

  const settingsContext: SettingsContextData = {
    ...baseSettingsContext,
    setTheme: jest.fn(),
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleInsaneMode: jest.fn(),
    toggleShowTopSites: jest.fn(),
    toggleSortingEnabled: jest.fn(),
    toggleOptOutReadingStreak: jest.fn(),
    toggleAutoDismissNotifications: jest.fn(),
    updateCustomLinks: jest.fn(),
    toggleSidebarExpanded: jest.fn(),
  };

  // Use a fresh QueryClient per render — the suite-level singleton can
  // carry over errored ad-query state from earlier tests (retry: false
  // means failures stick), which causes ads to never re-fetch here.
  const isolatedClient = new QueryClient(defaultQueryClientTestingConfig);

  return render(
    <QueryClientProvider client={isolatedClient}>
      <AuthContext.Provider
        value={{
          user,
          isLoggedIn: true,
          shouldShowLogin: false,
          showLogin,
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          closeLogin: jest.fn(),
          trackingId: user.id,
          loginState: undefined,
          isAuthReady: true,
        }}
      >
        <GrowthBookProvider growthbook={gb}>
          <FeaturesReadyContext.Provider
            value={{
              ready: true,
              getFeatureValue: (feature) =>
                gb.getFeatureValue(feature.id, feature.defaultValue),
            }}
          >
            <SettingsContext.Provider value={settingsContext}>
              <FeedContext.Provider value={feedContextValue}>
                <Feed
                  feedQueryKey={['feed']}
                  feedName={SharedFeedPage.MyFeed}
                  query={ANONYMOUS_FEED_QUERY}
                  variables={variables}
                  staticAd={staticAd}
                  disableAds={disableAds}
                />
              </FeedContext.Provider>
            </SettingsContext.Provider>
          </FeaturesReadyContext.Provider>
        </GrowthBookProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

const getFeedItemTestIds = async (expectedAdCount = 1): Promise<string[]> => {
  await waitFor(
    () => {
      const ads = screen.queryAllByTestId('adItem');
      expect(ads.length).toBeGreaterThanOrEqual(expectedAdCount);
    },
    { timeout: 5000 },
  );
  const nodes = document.querySelectorAll(
    '[data-testid="postItem"], [data-testid="adItem"]',
  );
  return Array.from(nodes).map(
    (node) => node.getAttribute('data-testid') ?? '',
  );
};

describe('Feed ad cadence with highlight cards', () => {
  // beforeEach in the outer describe calls jest.restoreAllMocks(), which
  // wipes the desktop viewport spy from the suite's beforeAll. Re-apply it
  // here so canRenderHighlightCards isn't gated off by a mobile viewport.
  // Also reset useRouter: earlier describes (e.g. acquisition form card)
  // call mockImplementation on it, and that impl survives clearAllMocks /
  // restoreAllMocks — leaving us with a polluted query/pathname.
  beforeEach(() => {
    jest.spyOn(hooks, 'useViewSize').mockImplementation(() => true);
    jest.mocked(useRouter).mockImplementation(
      () =>
        ({
          pathname: '/',
          query: {},
        } as unknown as NextRouter),
    );
    jest.mocked(useBoot).mockReturnValue({
      addSquad: jest.fn(),
      deleteSquad: jest.fn(),
      updateSquad: jest.fn(),
      getMarketingCta: jest.fn().mockReturnValue(null),
      clearMarketingCta: jest.fn(),
      getPlusEntryData: jest.fn().mockReturnValue(null),
    });
    jest.mocked(useReadingReminderFeedHero).mockReturnValue({
      shouldShowTopHero: false,
      title: '',
      subtitle: '',
      onEnableHero: jest.fn(),
      onDismissHero: jest.fn(),
    });
  });

  // Setup: numCards=4, adStart=4, adRepeat=8. With 1 normal post per cell,
  // first ad lands at visual cell 4 (after 4 normal posts). With a 4-cell
  // wide post at index 0, vcs jumps to 4 after one item — so the ad lands
  // at array index 1 instead of index 4.
  it('places ad on correct spot when a wide card precedes it', async () => {
    const posts = [
      buildWidePost('w0', 4),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
    ];

    renderWithHighlightLayout({ posts, highlightEnabled: true });

    const order = await getFeedItemTestIds();
    expect(order[0]).toBe('postItem');
    expect(order[1]).toBe('adItem');
    expect(order.slice(2).every((t) => t === 'postItem')).toBe(true);
  });

  // Same fixture, flag off: layout disabled → wide card collapses to 1 cell
  // (every item contributes 1 to visualCellsSoFar). Ad falls at the original
  // 4th position.
  it('places ad on correct spot when feature flag is disabled', async () => {
    const posts = [
      buildWidePost('w0', 4),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
    ];

    renderWithHighlightLayout({ posts, highlightEnabled: false });

    const order = await getFeedItemTestIds();
    expect(order.slice(0, 4).every((t) => t === 'postItem')).toBe(true);
    expect(order[4]).toBe('adItem');
  });

  // Two wide cards spaced beyond minSpacing each push the cadence forward,
  // so two ads land in a single page that would only contain one without
  // the layout enabled.
  it('places ad on correct spot across multiple wide cards', async () => {
    const posts = [
      buildWidePost('w0', 4),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
      buildPost('p8'),
      buildWidePost('w9', 4),
    ];

    renderWithHighlightLayout({ posts, highlightEnabled: true });

    const order = await getFeedItemTestIds(2);
    const adIndices = order
      .map((t, i) => (t === 'adItem' ? i : -1))
      .filter((i) => i >= 0);
    expect(adIndices).toEqual([1, 9]);
  });

  // Straddle scenario: a wide card placed where its full requested span
  // would jump past a scheduled ad slot. The fit-to-ad-slot clamp shrinks
  // the wide card so vcs lands exactly on the slot and the ad fires —
  // preserving the impression that the old "mod === 0" check dropped.
  it('does not drop an ad when a wide card straddles the next slot', async () => {
    // adStart=3, adRepeat=8. First slot at vcs=3, second at vcs=11.
    // First post is a size-4 wide. Without the clamp it'd jump vcs 0→4,
    // skipping vcs=3 entirely; the clamp shrinks it to span 3 so vcs=3
    // lands on the slot and the ad fires next iteration.
    const posts = [
      buildWidePost('w0', 4),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
    ];

    renderWithHighlightLayout({
      posts,
      highlightEnabled: true,
      numCards: 4,
      adStart: 3,
      adRepeat: 8,
    });

    const order = await getFeedItemTestIds(1);
    const adIndices = order
      .map((t, i) => (t === 'adItem' ? i : -1))
      .filter((i) => i >= 0);
    // Exactly one ad rendered (no drop), and it lands after the wide
    // card (which landed at index 0).
    expect(adIndices.length).toBe(1);
    expect(adIndices[0]).toBe(1);
  });

  // Verifies the brief-banner integration end-to-end: useFeed exposes the
  // banner via `bannerInsertions` (computed from the feature flag), Feed
  // renders the banner element, and the placement builder accounts for
  // the banner-induced col reset so ad cadence stays aligned with what
  // is actually rendered.
  it('renders brief banner from useFeed and keeps ads flowing', async () => {
    const posts = [
      buildPost('p0'),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
    ];

    renderWithHighlightLayout({
      posts,
      highlightEnabled: false,
      // pageSize=8, numCards=4 → banner at index 8 (end of page 1).
      pageSize: 8,
      briefBannerPage: 1,
    });

    await waitFor(() => {
      expect(screen.queryByTestId('brief-banner-feed')).toBeInTheDocument();
    });
    // Ads still render alongside the banner (no regression in cadence).
    expect(await screen.findByTestId('adItem')).toBeInTheDocument();
  });

  it('inserts staticAd at the requested index via the cadence walk', async () => {
    const posts = [
      buildPost('p0'),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
    ];
    const staticAdFixture: Ad = {
      ...ad,
      link: 'https://daily.dev/static-ad-marker',
    };

    renderWithHighlightLayout({
      posts,
      highlightEnabled: false,
      staticAd: { ad: staticAdFixture, index: 2 },
    });

    const order = await getFeedItemTestIds(1);
    expect(order[2]).toBe('adItem');
    expect(order[0]).toBe('postItem');
    expect(order[1]).toBe('postItem');
  });

  it('places a marketing CTA at index 0 when asFirstCard is set', async () => {
    const marketingCtaTitle = 'Marketing CTA title';
    const marketingCta: MarketingCta = {
      campaignId: 'cta-test',
      variant: MarketingCtaVariant.Card,
      createdAt: new Date(),
      flags: {
        title: marketingCtaTitle,
        ctaText: 'Click me',
        ctaUrl: 'https://daily.dev/cta',
        asFirstCard: true,
      },
    };
    jest.mocked(useBoot).mockReturnValue({
      addSquad: jest.fn(),
      deleteSquad: jest.fn(),
      updateSquad: jest.fn(),
      getMarketingCta: jest.fn((variant) =>
        variant === MarketingCtaVariant.Card ? marketingCta : null,
      ),
      clearMarketingCta: jest.fn(),
      getPlusEntryData: jest.fn().mockReturnValue(null),
    });

    const posts = [
      buildPost('p0'),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
      buildPost('p8'),
    ];

    // adStart=2, adRepeat=4 → 3 slots at vcs 2, 6, 10. CTA pushed first
    // shifts vcs by 1. Slot 0 (vcs=2) is skipped by asFirstCard; slots
    // 1 and 2 (vcs=6, 10) fire. CTA itself has no postItem/adItem testid,
    // so it's filtered out of the helper output — ads land at testid'd
    // indices 5 and 9.
    renderWithHighlightLayout({
      posts,
      highlightEnabled: false,
      adStart: 2,
      adRepeat: 4,
    });

    expect(
      await screen.findByText(marketingCtaTitle, undefined, { timeout: 5000 }),
    ).toBeInTheDocument();

    const order = await getFeedItemTestIds(2);
    const adIndices = order
      .map((t, i) => (t === 'adItem' ? i : -1))
      .filter((i) => i >= 0);
    expect(adIndices).toEqual([5, 9]);
    expect(order.filter((t) => t === 'postItem').length).toBe(posts.length);
  });

  it('renders highlight cards for Plus users without rendering ads', async () => {
    const posts = [
      buildPost('p0'),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildWidePost('w4', 3),
    ];

    renderWithHighlightLayout({
      posts,
      highlightEnabled: true,
      adStart: 4,
      adRepeat: 8,
      user: { ...defaultUser, isPlus: true },
    });

    await waitFor(() => {
      expect(screen.queryAllByTestId('postItem').length).toBe(posts.length);
    });
    expect(screen.queryAllByTestId('adItem').length).toBe(0);
  });

  it('skips the ad-cadence clamp on wide cards for Plus users', async () => {
    const posts = [
      buildPost('p0'),
      buildPost('p1'),
      buildPost('p2'),
      buildPost('p3'),
      buildPost('p4'),
      buildPost('p5'),
      buildPost('p6'),
      buildPost('p7'),
      buildWidePost('w8', 4),
    ];

    renderWithHighlightLayout({
      posts,
      highlightEnabled: true,
      adStart: 2,
      adRepeat: 8,
      user: { ...defaultUser, isPlus: true },
    });

    await waitFor(() => {
      expect(screen.queryAllByTestId('postItem').length).toBe(posts.length);
    });
    const wrappers = await screen.findAllByTestId('feedItemColSpanWrapper');
    const styles = wrappers.map((el) => el.getAttribute('style') ?? '');
    expect(styles.some((s) => s.includes('span 4'))).toBe(true);
    expect(screen.queryAllByTestId('adItem').length).toBe(0);
  });
});
