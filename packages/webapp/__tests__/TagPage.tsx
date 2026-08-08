import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { TAG_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type {
  LoggedUser,
  UserShortProfile,
} from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import type {
  AllTagCategoriesData,
  FeedSettings,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { CampaignCtaPlacement } from '@dailydotdev/shared/src/graphql/settings';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { SortCommentsBy } from '@dailydotdev/shared/src/graphql/comments';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import { globalMutationCache } from '@dailydotdev/shared/src/lib/query';
import SettingsContext, {
  ThemeMode,
  type SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { ARCHIVE_INDEX_QUERY } from '@dailydotdev/shared/src/graphql/archive';
import {
  CONTENT_PREFERENCE_FOLLOW_MUTATION,
  CONTENT_PREFERENCE_STATUS_QUERY,
  ContentPreferenceStatus,
  ContentPreferenceType,
} from '@dailydotdev/shared/src/graphql/contentPreference';
import TagPage from '../pages/tags/[tag]';
import { FEED_SETTINGS_QUERY } from '../../shared/src/graphql/feedSettings';

const showLogin = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/tags',
        query: {},
      } as unknown as NextRouter),
  ),
}));

beforeEach(() => {
  global.ResizeObserver = jest.fn(() => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      trigger: jest.fn(),
    };
  });
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
});

afterEach(() => {
  jest.clearAllMocks();
});

const tagFeedSupportedTypes = [
  PostType.Article,
  PostType.VideoYouTube,
  PostType.Collection,
  PostType.Share,
  PostType.Freeform,
  PostType.LiveRoom,
];

const createFeedMock = (
  page = defaultFeedPage,
  query: string = TAG_FEED_QUERY,
  variables: Record<string, unknown> = {
    first: 7,
    after: '',
    loggedIn: true,
    tag: 'react',
    ranking: 'TIME',
    supportedTypes: tagFeedSupportedTypes,
    columns: 1,
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

const createTagsSettingsMock = (
  feedSettings: FeedSettings = { includeTags: [], blockedTags: [] },
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
    },
  },
});

let client: QueryClient;

const initialDataObj: Keyword = {
  value: 'react',
  occurrences: 1,
  status: 'allow',
};

const topContributor: UserShortProfile = {
  id: '1',
  name: 'Ido',
  image: 'https://daily.dev/ido.jpg',
  username: 'idoshamun',
  permalink: '/idoshamun',
  createdAt: new Date().toISOString(),
  reputation: 10,
};

const createContentPreferenceMock = (
  status: ContentPreferenceStatus,
): MockedGraphQLResponse => ({
  request: {
    query: CONTENT_PREFERENCE_STATUS_QUERY,
    variables: { id: 'react', entity: ContentPreferenceType.Keyword },
  },
  result: {
    data: {
      contentPreferenceStatus: {
        referenceId: 'react',
        type: ContentPreferenceType.Keyword,
        status,
        createdAt: new Date().toISOString(),
      },
    },
  },
});

const createArchiveIndexMock = (): MockedGraphQLResponse => ({
  request: {
    query: ARCHIVE_INDEX_QUERY,
    variables: {
      subjectType: 'post',
      rankingType: 'best',
      scopeType: 'tag',
      scopeId: 'react',
    },
  },
  result: { data: { archiveIndex: [] } },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock(), createTagsSettingsMock()],
  user: LoggedUser | null = defaultUser,
  initialData: Keyword = initialDataObj,
  topContributors: UserShortProfile[] = [],
): RenderResult => {
  // Use the app's mutation cache so `useMutationSubscription` consumers (e.g.
  // the tag's content-preference status) react to mutations like they do in
  // the real client.
  client = new QueryClient({ mutationCache: globalMutationCache });

  (mocks ?? [createFeedMock(), createTagsSettingsMock()]).forEach(mockGraphQL);
  mockGraphQL(createArchiveIndexMock());
  nock('http://localhost:3000')
    .get('/v1/a?active=false&gdpr=0')
    .reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    openNewTab: true,
    setTheme: jest.fn().mockResolvedValue(undefined),
    themeMode: ThemeMode.Dark,
    setSpaciness: jest.fn().mockResolvedValue(undefined),
    toggleOpenNewTab: jest.fn().mockResolvedValue(undefined),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn().mockResolvedValue(undefined),
    showTopSites: true,
    toggleShowTopSites: jest.fn().mockResolvedValue(undefined),
    sidebarExpanded: false,
    companionExpanded: false,
    sortingEnabled: false,
    optOutReadingStreak: false,
    optOutStreakFreeze: false,
    toggleOptOutStreakFreeze: jest.fn().mockResolvedValue(undefined),
    optOutLevelSystem: false,
    optOutQuestSystem: false,
    optOutAchievements: false,
    isGamificationEnabled: true,
    isQuestExperienceEnabled: true,
    toggleQuestExperience: jest.fn().mockResolvedValue(undefined),
    toggleOptOutAchievements: jest.fn().mockResolvedValue(undefined),
    toggleAllGamification: jest.fn().mockResolvedValue(undefined),
    optOutCompanion: false,
    autoDismissNotifications: true,
    sortCommentsBy: SortCommentsBy.OldestFirst,
    showFeedbackButton: true,
    campaignCtaPlacement: CampaignCtaPlacement.Header,
    flags: {
      sidebarSquadExpanded: true,
      sidebarCustomFeedsExpanded: true,
      sidebarOtherExpanded: true,
      sidebarResourcesExpanded: true,
      sidebarBookmarksExpanded: true,
      clickbaitShieldEnabled: true,
    },
    toggleSidebarExpanded: jest.fn().mockResolvedValue(undefined),
    toggleSortingEnabled: jest.fn().mockResolvedValue(undefined),
    toggleOptOutReadingStreak: jest.fn().mockResolvedValue(undefined),
    toggleOptOutLevelSystem: jest.fn().mockResolvedValue(undefined),
    toggleOptOutQuestSystem: jest.fn().mockResolvedValue(undefined),
    toggleOptOutCompanion: jest.fn().mockResolvedValue(undefined),
    toggleAutoDismissNotifications: jest.fn().mockResolvedValue(undefined),
    toggleShowFeedbackButton: jest.fn().mockResolvedValue(undefined),
    updateCustomLinks: jest.fn().mockResolvedValue(undefined),
    updateSortCommentsBy: jest.fn().mockResolvedValue(undefined),
    updateFlag: jest.fn().mockResolvedValue(undefined),
    updateFlagRemote: jest.fn().mockResolvedValue(undefined),
    updatePromptFlag: jest.fn().mockResolvedValue(undefined),
    syncSettings: jest.fn().mockResolvedValue(undefined),
    onToggleHeaderPlacement: jest.fn().mockResolvedValue(undefined),
    setSettings: jest.fn().mockResolvedValue(undefined),
    applyThemeMode: jest.fn(),
  };
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          ...(user && { user }),
          isLoggedIn: !!user,
          shouldShowLogin: false,
          showLogin,
          closeLogin: jest.fn(),
          logout: jest.fn().mockResolvedValue(undefined),
          updateUser: jest.fn().mockResolvedValue(undefined),
          tokenRefreshed: true,
          getRedirectUri: jest.fn(),
          isAuthReady: true,
        }}
      >
        <AlertContextProvider alerts={{}} updateAlerts={jest.fn()} loadedAlerts>
          <SettingsContext.Provider value={settingsContext}>
            <TagPage
              tag="react"
              initialData={initialData}
              topPosts={[]}
              recommendedTags={[]}
              topContributors={topContributors}
            />
          </SettingsContext.Provider>
        </AlertContextProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request tag feed', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should show follow and block buttons', async () => {
  renderComponent();
  await waitForNock();
  const followButton = await screen.findByLabelText('Follow');
  expect(followButton).toBeInTheDocument();
  const blockButton = await screen.findByLabelText('Block');
  expect(blockButton).toBeInTheDocument();
});

it('should show only unfollow button', async () => {
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
  ]);
  await waitForNock();
  const followButton = await screen.findByLabelText('Unfollow');
  expect(followButton).toBeInTheDocument();
  const blockButton = screen.queryByLabelText('Block');
  expect(blockButton).not.toBeInTheDocument();
});

it('should not show the notify button when not following the tag', async () => {
  renderComponent();
  await waitForNock();
  await screen.findByLabelText('Follow');
  expect(
    screen.queryByLabelText('Enable notifications'),
  ).not.toBeInTheDocument();
});

it('should show the notify button when following the tag', async () => {
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
    createContentPreferenceMock(ContentPreferenceStatus.Follow),
  ]);
  await waitForNock();
  const notifyButton = await screen.findByLabelText('Enable notifications');
  expect(notifyButton).toBeInTheDocument();
});

it('should show the notify button as on when subscribed to the tag', async () => {
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
    createContentPreferenceMock(ContentPreferenceStatus.Subscribed),
  ]);
  await waitForNock();
  const notifyButton = await screen.findByLabelText('Disable notifications');
  expect(notifyButton).toBeInTheDocument();
});

it('should subscribe to the tag on notify click', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
    createContentPreferenceMock(ContentPreferenceStatus.Follow),
  ]);
  await waitForNock();
  mockGraphQL({
    request: {
      query: CONTENT_PREFERENCE_FOLLOW_MUTATION,
      variables: {
        id: 'react',
        entity: ContentPreferenceType.Keyword,
        status: ContentPreferenceStatus.Subscribed,
      },
    },
    result: () => {
      mutationCalled = true;
      return { data: { _: true } };
    },
  });
  const notifyButton = await screen.findByLabelText('Enable notifications');
  notifyButton.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await screen.findByLabelText('Disable notifications');
});

it('should show follow and block buttons when logged-out', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        after: '',
        loggedIn: false,
        tag: 'react',
        ranking: 'TIME',
        supportedTypes: tagFeedSupportedTypes,
        columns: 1,
      }),
    ],
    null,
  );
  await waitForNock();
  const followButton = await screen.findByLabelText('Follow');
  expect(followButton).toBeInTheDocument();
  const blockButton = await screen.findByLabelText('Block');
  expect(blockButton).toBeInTheDocument();
});

it('should show login popup when logged-out on follow click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        after: '',
        loggedIn: false,
        tag: 'react',
        ranking: 'TIME',
        supportedTypes: tagFeedSupportedTypes,
        columns: 1,
      }),
    ],
    null,
  );
  await waitForNock();
  const followButton = await screen.findByLabelText('Follow');
  followButton.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should render who to follow section from static props', async () => {
  renderComponent(undefined, defaultUser, initialDataObj, [topContributor]);

  expect(
    await screen.findByRole('heading', {
      level: 2,
      name: 'Who to follow for React',
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', {
      level: 2,
      name: 'Recommended React stories',
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { level: 2, name: 'All posts about React' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Ido').closest('a')).toHaveAttribute(
    'href',
    '/idoshamun',
  );
});

it('should show login popup when logged-out on block click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        after: '',
        loggedIn: false,
        tag: 'react',
        ranking: 'TIME',
        supportedTypes: tagFeedSupportedTypes,
        columns: 1,
      }),
    ],
    null,
  );
  await waitForNock();
  const blockButton = await screen.findByLabelText('Block');
  blockButton.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should follow tag', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { includeTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Follow');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    const unfollowButton = await screen.findByLabelText('Unfollow');
    expect(unfollowButton).toBeInTheDocument();
  });
});

it('should block tag', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { blockedTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Block');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());

  await waitFor(async () => {
    const unfollowButton = await screen.findByLabelText('Unblock');
    expect(unfollowButton).toBeInTheDocument();
  });
});

it('should unfollow tag', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ includeTags: ['react'] }),
  ]);
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { includeTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Unfollow');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    const followButton = await screen.findByLabelText('Follow');
    expect(followButton).toBeInTheDocument();
  });
});

it('should unblock tag', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    createTagsSettingsMock({ blockedTags: ['react'] }),
  ]);
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { blockedTags: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Unblock');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    const followButton = await screen.findByLabelText('Block');
    expect(followButton).toBeInTheDocument();
  });
});

it('should load title and description for tag', async () => {
  renderComponent(
    [createFeedMock(), createTagsSettingsMock()],
    defaultUser,
    {
      ...initialDataObj,
      flags: {
        title: 'React custom title',
        description: 'React is an amazing framework',
      },
    },
    [topContributor],
  );

  await waitFor(() => {
    expect(
      screen.getByRole('heading', { level: 1, name: 'React custom title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('React is an amazing framework'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Who to follow for React custom title',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'All posts about React custom title',
      }),
    ).toBeInTheDocument();
  });
});
