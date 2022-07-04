import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { TAG_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter } from 'next/router';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  AllTagCategoriesData,
  FeedSettings,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import TagPage from '../pages/tags/[tag]';
import { FEED_SETTINGS_QUERY } from '../../shared/src/graphql/feedSettings';

const showLogin = jest.fn();

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        isFallback: false,
        query: {},
      } as unknown as NextRouter),
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  nock.cleanAll();
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = TAG_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    tag: 'react',
    unreadOnly: false,
    ranking: 'TIME',
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
  loggedIn = true,
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY, variables: { loggedIn } },
  result: {
    data: {
      feedSettings,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock(), createTagsSettingsMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);
  const settingsContext: SettingsContextData = {
    spaciness: 'eco',
    showOnlyUnreadPosts: false,
    openNewTab: true,
    setTheme: jest.fn(),
    themeMode: 'dark',
    setSpaciness: jest.fn(),
    toggleOpenNewTab: jest.fn(),
    toggleShowOnlyUnreadPosts: jest.fn(),
    insaneMode: false,
    loadedSettings: true,
    toggleInsaneMode: jest.fn(),
    showTopSites: true,
    toggleShowTopSites: jest.fn(),
  };
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
          getRedirectUri: jest.fn(),
        }}
      >
        <SettingsContext.Provider value={settingsContext}>
          <TagPage tag="react" />
        </SettingsContext.Provider>
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

it('should show follow and block buttons when logged-out', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        tag: 'react',
        unreadOnly: false,
        ranking: 'TIME',
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
        loggedIn: false,
        tag: 'react',
        unreadOnly: false,
        ranking: 'TIME',
      }),
    ],
    null,
  );
  await waitForNock();
  const followButton = await screen.findByLabelText('Follow');
  followButton.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should show login popup when logged-out on block click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, TAG_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        tag: 'react',
        unreadOnly: false,
        ranking: 'TIME',
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
