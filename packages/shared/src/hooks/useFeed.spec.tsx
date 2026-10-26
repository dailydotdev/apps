import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import nock from 'nock';
import useFeed, { getAdJitterSeed } from './useFeed';
import type { AuthContextData } from '../contexts/AuthContext';
import { useAuthContext } from '../contexts/AuthContext';
import { BootDataProvider } from '../contexts/BootProvider';
import { BOOT_LOCAL_KEY } from '../contexts/common';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { defaultQueryClientTestingConfig } from '../../__tests__/helpers/tanstack-query';
import defaultUser from '../../__tests__/fixture/loggedUser';
import defaultFeedPage from '../../__tests__/fixture/feed';
import { CUSTOM_FEED_QUERY } from '../graphql/feed';
import { ApiError, gqlClient } from '../graphql/common';
import type { Boot } from '../lib/boot';
import { BootApp, getBootData } from '../lib/boot';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey } from '../lib/query';
import { SharedFeedPage } from '../components/utilities';
import { FeedItemType } from '../components/cards/common/common';

jest.mock('../lib/boot', () => ({
  ...jest.requireActual('../lib/boot'),
  getBootData: jest.fn(),
}));

const mockCustomFeedResponse = (result: Record<string, unknown>) =>
  nock('http://localhost:3000')
    .post('/graphql', ({ query }) => query === CUSTOM_FEED_QUERY)
    .reply(200, result);

it('should refetch a feed rejected as unauthenticated once boot refreshes the token', async () => {
  const client = new QueryClient();
  let auth: Partial<AuthContextData> = {
    user: defaultUser,
    tokenRefreshed: false,
    isTokenValid: true,
  };
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={auth}>
      {children}
    </TestBootProvider>
  );
  mockCustomFeedResponse({
    errors: [
      {
        message: 'Unauthenticated',
        extensions: { code: ApiError.Unauthenticated },
      },
    ],
  });

  // A custom feed for a non-Plus user never retries on its own
  const { result, rerender } = renderHook(
    () =>
      useFeed(['custom', defaultUser.id, 'cf1'], 7, { adStart: 1 }, 1, {
        query: CUSTOM_FEED_QUERY,
        variables: { feedId: 'cf1' },
        settings: { feedName: SharedFeedPage.Custom, disableAds: true },
      }),
    { wrapper },
  );
  await waitFor(() => expect(result.current.error).toBeTruthy());

  mockCustomFeedResponse({ data: { page: defaultFeedPage } });
  auth = { ...auth, tokenRefreshed: true };
  rerender();

  await waitFor(() =>
    expect(
      result.current.items.some(({ type }) => type === FeedItemType.Post),
    ).toBe(true),
  );
});

const inMinutes = (minutes: number): string =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

const [earlyPost, refetchedPost] = defaultFeedPage.edges;
const toPage = (edge: typeof earlyPost) => ({
  page: { pageInfo: defaultFeedPage.pageInfo, edges: [edge] },
});

it.each([
  {
    name: 'keep the early feed when boot confirms the cached token',
    user: defaultUser,
    reissued: false,
    requests: 1,
    shownPost: earlyPost,
  },
  {
    name: 'refetch the early feed once when boot reissues the cached token',
    user: defaultUser,
    reissued: true,
    requests: 2,
    shownPost: refetchedPost,
  },
  {
    name: 'leave a user change to the new query key',
    user: { ...defaultUser, id: 'u2' } as LoggedUser,
    reissued: true,
    requests: 2,
    shownPost: refetchedPost,
  },
])('should $name', async ({ user, reissued, requests, shownPost }) => {
  const cachedExpiresIn = inMinutes(10);
  localStorage.setItem(
    BOOT_LOCAL_KEY,
    JSON.stringify({
      user: defaultUser,
      exp: { fv: 'v1', e: [], a: [], features: { flag: { defaultValue: 1 } } },
      accessTokenExpiresIn: cachedExpiresIn,
    }),
  );
  jest.mocked(useRouter).mockReturnValue({
    query: {},
    pathname: '/',
    isReady: true,
    push: jest.fn(),
  } as unknown as NextRouter);
  let resolveBoot: (boot: Boot) => void = () => undefined;
  jest.mocked(getBootData).mockReturnValueOnce(
    new Promise((resolve) => {
      resolveBoot = resolve;
    }),
  );
  let feedRequests = 0;
  let resolveEarlyFeed: () => void = () => undefined;
  const request = gqlClient.request.bind(gqlClient);
  jest.spyOn(gqlClient, 'request').mockImplementation(((
    query: string,
    variables,
  ) => {
    if (query !== CUSTOM_FEED_QUERY) {
      return request(query, variables);
    }

    feedRequests += 1;
    if (feedRequests > 1) {
      return Promise.resolve(toPage(refetchedPost));
    }

    return new Promise<ReturnType<typeof toPage>>((resolve) => {
      resolveEarlyFeed = () => resolve(toPage(earlyPost));
    });
  }) as typeof gqlClient.request);

  const client = new QueryClient(defaultQueryClientTestingConfig);
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <QueryClientProvider client={client}>
      <BootDataProvider
        app={BootApp.Webapp}
        version="test-version"
        deviceId="test-device"
        getPage={() => '/'}
        getRedirectUri={jest.fn()}
      >
        {children}
      </BootDataProvider>
    </QueryClientProvider>
  );
  const { result } = renderHook(
    () => {
      const { user: currentUser, isAuthReady } = useAuthContext();
      const feed = useFeed(
        generateQueryKey(SharedFeedPage.Custom, currentUser, 'cf1'),
        7,
        { adStart: 1 },
        1,
        {
          query: CUSTOM_FEED_QUERY,
          variables: { feedId: 'cf1' },
          settings: { feedName: SharedFeedPage.Custom, disableAds: true },
        },
      );

      return { feed, isAuthReady };
    },
    { wrapper },
  );

  // The feed goes out before boot and is still in flight once boot is applied
  await waitFor(() => expect(feedRequests).toEqual(1));
  await act(async () =>
    resolveBoot({
      user,
      accessToken: {
        token: 'token',
        expiresIn: reissued ? inMinutes(15) : cachedExpiresIn,
      },
      visit: { sessionId: 's', visitId: 'v' },
    } as Boot),
  );
  await waitFor(() => expect(result.current.isAuthReady).toBe(true));
  await act(async () => resolveEarlyFeed());

  await waitFor(() => {
    const [item] = result.current.feed.items;
    expect(item.type === FeedItemType.Post && item.post.id).toEqual(
      shownPost.node.id,
    );
  });
  expect(feedRequests).toEqual(requests);
  jest.mocked(gqlClient.request).mockRestore();
});

it('should keep a post the surface above the feed shows out of the grid', async () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      {children}
    </TestBootProvider>
  );
  const [shownAbove, ...rest] = defaultFeedPage.edges;
  mockCustomFeedResponse({ data: { page: defaultFeedPage } });

  const { result } = renderHook(
    () =>
      useFeed(['custom', defaultUser.id, 'excluded'], 7, { adStart: 1 }, 1, {
        query: CUSTOM_FEED_QUERY,
        variables: { feedId: 'cf1' },
        settings: {
          feedName: SharedFeedPage.Custom,
          disableAds: true,
          excludedPostIds: [shownAbove.node.id],
        },
      }),
    { wrapper },
  );

  await waitFor(() =>
    expect(
      result.current.items.filter(({ type }) => type === FeedItemType.Post),
    ).toHaveLength(rest.length),
  );
  expect(
    result.current.items.some(
      (item) =>
        item.type === FeedItemType.Post && item.post.id === shownAbove.node.id,
    ),
  ).toBe(false);
});

it('should leave a post the grid already shows when its exclusion comes late', async () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      {children}
    </TestBootProvider>
  );
  const [shown] = defaultFeedPage.edges;
  mockCustomFeedResponse({ data: { page: defaultFeedPage } });
  let excludedPostIds: string[] = [];

  const { result, rerender } = renderHook(
    () =>
      useFeed(['custom', defaultUser.id, 'late'], 7, { adStart: 1 }, 1, {
        query: CUSTOM_FEED_QUERY,
        variables: { feedId: 'cf1' },
        settings: {
          feedName: SharedFeedPage.Custom,
          disableAds: true,
          excludedPostIds,
        },
      }),
    { wrapper },
  );
  await waitFor(() =>
    expect(
      result.current.items.filter(({ type }) => type === FeedItemType.Post),
    ).toHaveLength(defaultFeedPage.edges.length),
  );

  excludedPostIds = [shown.node.id];
  rerender();

  expect(
    result.current.items.filter(({ type }) => type === FeedItemType.Post),
  ).toHaveLength(defaultFeedPage.edges.length);
});

it('should keep the ad seed for a feed until it loads afresh', () => {
  const loading = getAdJitterSeed('feed-a', false);
  const loaded = getAdJitterSeed('feed-a', true);

  expect(loaded).toBe(loading);
  expect(getAdJitterSeed('feed-a', true)).toBe(loaded);
  expect(getAdJitterSeed('feed-b', true)).not.toBe(loaded);
  expect(getAdJitterSeed('feed-a', false)).not.toBe(loaded);
});

it('should report an empty feed once every loaded page held only excluded posts', async () => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <TestBootProvider client={client} auth={{ user: defaultUser }}>
      {children}
    </TestBootProvider>
  );
  const [excludedEdge] = defaultFeedPage.edges;
  mockCustomFeedResponse({
    data: {
      page: {
        pageInfo: { hasNextPage: true, endCursor: 'next' },
        edges: [excludedEdge],
      },
    },
  });

  const { result } = renderHook(
    () =>
      useFeed(
        ['custom', defaultUser.id, 'all-excluded'],
        7,
        { adStart: 1 },
        1,
        {
          query: CUSTOM_FEED_QUERY,
          variables: { feedId: 'cf1' },
          settings: {
            feedName: SharedFeedPage.Custom,
            disableAds: true,
            excludedPostIds: [excludedEdge.node.id],
          },
        },
      ),
    { wrapper },
  );

  await waitFor(() => expect(result.current.isFetching).toBe(false));
  expect(result.current.emptyFeed).toBe(false);

  mockCustomFeedResponse({
    data: {
      page: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [] },
    },
  });
  await act(() => result.current.fetchPage());

  await waitFor(() => expect(result.current.emptyFeed).toBe(true));
});
