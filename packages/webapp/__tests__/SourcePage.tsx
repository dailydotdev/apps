import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { MockedGraphQLResponse, mockGraphQL } from './helpers/graphql';
import { SOURCE_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import { render, RenderResult, screen, waitFor } from '@testing-library/preact';
import defaultFeedPage from './fixture/feed';
import defaultUser from './fixture/loggedUser';
import ad from './fixture/ad';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { NextRouter } from 'next/router';
import SourcePage from '../pages/sources/[source]';
import { Source } from '@dailydotdev/shared/src/graphql/sources';
import SettingsContext, {
  SettingsContextData,
} from '@dailydotdev/shared/src/contexts/SettingsContext';
import {
  FeedSettings,
  FeedSettingsData,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
  SOURCES_SETTINGS_QUERY,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { getSourcesSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useMutateFilters';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';

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
    setUIThemeMode: jest.fn(),
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
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
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
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add source to feed');
  expect(button).toHaveClass('visible');
});

it('should not show add to feed button', async () => {
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  await waitFor(async () => {
    const [button] = await screen.findAllByLabelText('Add source to feed');
    expect(button).toHaveClass('invisible');
  });
});

it('should show add to feed button when logged-out', async () => {
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
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add source to feed');
  expect(button).toHaveClass('visible');
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
  await waitFor(() => expect(nock.isDone()).toBeTruthy());
  const [button] = await screen.findAllByLabelText('Add source to feed');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should add new source filter', async () => {
  let mutationCalled = false;
  renderComponent();
  await waitFor(async () => {
    const data = await client.getQueryData(
      getSourcesSettingsQueryKey(defaultUser),
    );
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
  const [button] = await screen.findAllByLabelText('Add source to feed');
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  await waitFor(async () => {
    expect(button).toHaveClass('invisible');
  });
});
