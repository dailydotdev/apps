import type { FeedData } from '@dailydotdev/shared/src/graphql/posts';

import {
  baseFeedSupportedTypes,
  SOURCE_FEED_QUERY,
} from '@dailydotdev/shared/src/graphql/feed';
import nock from 'nock';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import React from 'react';
import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import type { NextRouter } from 'next/router';
import type { Source } from '@dailydotdev/shared/src/graphql/sources';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import SettingsContext from '@dailydotdev/shared/src/contexts/SettingsContext';
import type {
  AllTagCategoriesData,
  FeedSettings,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  REMOVE_FILTERS_FROM_FEED_MUTATION,
} from '@dailydotdev/shared/src/graphql/feedSettings';
import { getFeedSettingsQueryKey } from '@dailydotdev/shared/src/hooks/useFeedSettings';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import { createTestSettings } from '@dailydotdev/shared/__tests__/fixture/settings';
import type { MockedGraphQLResponse } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { mockGraphQL } from '@dailydotdev/shared/__tests__/helpers/graphql';
import { waitForNock } from '@dailydotdev/shared/__tests__/helpers/utilities';
import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import { getLogContextStatic } from '@dailydotdev/shared/src/contexts/LogContext';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';
import SourcePage from '../pages/sources/[source]';
import { FEED_SETTINGS_QUERY } from '../../shared/src/graphql/feedSettings';

const showLogin = jest.fn();
const logEvent = jest.fn();
const LogContext = getLogContextStatic();

jest.mock('next/router', () => ({
  useRouter: jest.fn().mockImplementation(
    () =>
      ({
        isFallback: false,
        pathname: '/',
        query: {},
        push: jest.fn(),
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

const createFeedMock = (
  page = defaultFeedPage,
  query: string = SOURCE_FEED_QUERY,
  variables: unknown = {
    first: 7,
    after: '',
    loggedIn: true,
    source: 'react',
    ranking: 'TIME',
    supportedTypes: baseFeedSupportedTypes,
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

const createSourcesSettingsMock = (
  feedSettings: FeedSettings = {
    excludeSources: [
      {
        id: 'react',
        name: 'React',
        image: 'https://reactjs.org',
        handle: 'react',
        permalink: 'permalink/react',
        type: SourceType.Machine,
        public: true,
      },
    ],
  },
): MockedGraphQLResponse<AllTagCategoriesData> => ({
  request: { query: FEED_SETTINGS_QUERY },
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
  source: Source = {
    id: 'react',
    name: 'React',
    image: 'https://reactjs.org',
    handle: 'react',
    permalink: 'permalink/react',
    type: SourceType.Machine,
    public: true,
  },
): RenderResult => {
  client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000')
    .get('/v1/a?active=false&gdpr=0')
    .reply(200, [ad]);
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider
        value={{
          user,
          isLoggedIn: !!user,
          shouldShowLogin: false,
          showLogin,
          closeLogin: jest.fn(),
          logout: jest.fn(),
          updateUser: jest.fn(),
          tokenRefreshed: true,
          isTokenValid: true,
          getRedirectUri: jest.fn(),
          isAuthReady: true,
          isAuthReadyOrCached: true,
        }}
      >
        <SettingsContext.Provider value={createTestSettings()}>
          <LogContext.Provider
            value={{
              logEvent,
              logEventStart: jest.fn(),
              logEventEnd: jest.fn(),
              sendBeacon: jest.fn(),
            }}
          >
            <SourcePage source={source} />
          </LogContext.Provider>
        </SettingsContext.Provider>
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

it('should log source feed events under the source feed name', async () => {
  renderComponent();
  const [post] = await screen.findAllByTestId('postItem');
  within(post).getAllByRole('link')[0].click();
  await waitFor(() =>
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ event_name: 'click' }),
    ),
  );
  const [{ extra }] = logEvent.mock.calls.find(
    ([event]) => event.event_name === 'click',
  );
  expect(JSON.parse(extra).feed).toEqual(OtherFeedPage.Source);
});

it('should show source image', async () => {
  renderComponent();
  const el = await screen.findByAltText('React logo');
  expect(el).toBeInTheDocument();
});

it('should show follow button', async () => {
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitForNock();
  const button = await screen.findAllByText('Follow');
  expect(button[0]).toBeInTheDocument();
});

it('should show notify button if following', async () => {
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({
      includeSources: [
        {
          id: 'react',
          name: 'React',
          image: 'https://reactjs.org',
          handle: 'react',
          permalink: 'permalink/react',
          type: SourceType.Machine,
          public: true,
        },
      ],
    }),
  ]);
  await waitForNock();
  const unfollowButton = await screen.findByText('Unfollow');
  expect(unfollowButton).toBeInTheDocument();
  const notifyButton = await screen.findByLabelText('Enable notifications');
  expect(notifyButton).toBeInTheDocument();
});

it('should show block button', async () => {
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitForNock();
  const button = await screen.findByTestId('blockButton');
  expect(button).toBeInTheDocument();
});

it('should show login popup when logged-out on add to feed click', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, SOURCE_FEED_QUERY, {
        first: 7,
        after: '',
        loggedIn: false,
        source: 'react',
        ranking: 'TIME',
        supportedTypes: baseFeedSupportedTypes,
        columns: 1,
      }),
    ],
    null,
  );
  await waitForNock();
  const button = await screen.findByTestId('blockButton');
  button.click();
  expect(showLogin).toBeCalledTimes(1);
});

it('should activate notify from source', async () => {
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
      query: REMOVE_FILTERS_FROM_FEED_MUTATION,
      variables: { filters: { excludeSources: ['react'] } },
    },
    result: () => {
      mutationCalled = true;
      return { data: { feedSettings: { id: defaultUser.id } } };
    },
  });
  const button = await screen.findByTestId('blockButton');
  const initialText = button.textContent;
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  expect(initialText).not.toBe(button.textContent);
});

it('should block source', async () => {
  let mutationCalled = false;
  renderComponent([
    createFeedMock(),
    createSourcesSettingsMock({ excludeSources: [] }),
  ]);
  await waitFor(async () => {
    const data = await client.getQueryData(
      getFeedSettingsQueryKey(defaultUser),
    );
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
  const button = await screen.findByTestId('blockButton');
  const initialText = button.textContent;
  button.click();
  await waitFor(() => expect(mutationCalled).toBeTruthy());
  expect(initialText).not.toBe(button.textContent);
});
