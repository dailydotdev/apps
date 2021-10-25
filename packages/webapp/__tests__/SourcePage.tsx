import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { SOURCE_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter } from 'next/router';
import { Source } from '@dailydotdev/shared/src/graphql/sources';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  SOURCES_SETTINGS_QUERY,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { getTagsFiltersQueryKey } from '@dailydotdev/shared/src/hooks/useMutateFilters';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import SourcePage from '../pages/sources/[source]';
import ad from './fixture/ad';
import defaultUser from './fixture/loggedUser';
import defaultFeedPage from './fixture/feed';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { waitForNock } from './helpers/utilities';

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
  query: string = SOURCE_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
    source: 'react',
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

const createSourcesSettingsMock = (
  feedSettings: FeedSettings = {
    excludeSources: [
      { id: 'react', name: 'React', image: 'https://reactjs.org' },
    ],
  },
): MockedGraphQLResponse<FeedSettingsData> => ({
  request: { query: SOURCES_SETTINGS_QUERY },
  result: {
    data: {
      feedSettings,
    },
  },
});

let client: QueryClient;

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [
    createFeedMock(),
    createSourcesSettingsMock(),
  ],
  user: LoggedUser = defaultUser,
  source: Source = { id: 'react', name: 'React', image: 'https://reactjs.org' },
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
            <SourcePage source={source} />
          </SettingsContext.Provider>
        </OnboardingContext.Provider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
};

it('should request source feed', async () => {
  renderComponent();
  await waitForNock();
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should show source image', async () => {
  renderComponent();
  const el = await screen.findByAltText('React logo');
  expect(el).toBeInTheDocument();
});

it('should show add to feed button', async () => {
  renderComponent();
  await waitForNock();
  const button = await screen.findByLabelText('Follow');
  expect(button).toBeInTheDocument();
});

it('should show block button', async () => {
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitForNock();
  const button = await screen.findByLabelText('Block');
  expect(button).toBeInTheDocument();
});

it('should show login popup when logged-out on add to feed click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, SOURCE_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        source: 'react',
        unreadOnly: false,
        ranking: 'TIME',
      }),
    ],
    null,
  );
  await waitForNock();
  const button = await screen.findByLabelText('Follow');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should follow source', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(getTagsFiltersQueryKey(defaultUser));
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { excludeSources: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Follow');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  const blockButton = await screen.findByLabelText('Block');
  expect(blockButton).toBeInTheDocument();
});

it('should block source', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitFor(async () => {
    const data = await client.getQueryData(getTagsFiltersQueryKey(defaultUser));
    expect(data).toBeTruthy();
  });
  mockGraphQL({
    request: {
      query: ADD_FILTERS_TO_FEED_MUTATION,
      variables: { filters: { excludeSources: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByLabelText('Block');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  const blockButton = await screen.findByLabelText('Follow');
  expect(blockButton).toBeInTheDocument();
});
