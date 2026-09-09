import React from 'react';
import type { ReactNode } from 'react';
import nock from 'nock';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import { mockGraphQL } from '../../__tests__/helpers/graphql';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { ActionType, COMPLETED_USER_ACTIONS } from '../graphql/actions';
import { FEED_LIST_QUERY } from '../graphql/feed';
import { SHELL_STATE_QUERY } from '../graphql/shellState';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import { useActions } from '../hooks/useActions';
import { useFeeds } from '../hooks/feed/useFeeds';
import { ShellStateProvider } from './ShellStateProvider';

let queryClient: QueryClient;

const feedListVariables = { includeTagChipFeeds: false };

const shellStateData = {
  actions: [{ type: 'my_feed', completedAt: '2024-01-01T00:00:00.000Z' }],
  userStreak: {
    max: 5,
    total: 10,
    current: 3,
    lastViewAt: '2024-01-01T00:00:00.000Z',
    weekStart: 1,
    freezesAvailable: 0,
  },
  feedList: {
    pageInfo: { endCursor: null, hasNextPage: false },
    edges: [{ node: { id: 'f1', userId: loggedUser.id } }],
  },
};

beforeEach(() => {
  nock.cleanAll();
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: StaleTime.Base } },
  });
});

const Wrapper = ({ children }: { children: ReactNode }) => (
  <TestBootProvider client={queryClient} auth={{ user: loggedUser }}>
    <ShellStateProvider>{children}</ShellStateProvider>
  </TestBootProvider>
);

describe('ShellStateProvider', () => {
  it('seeds the actions, streak and feed list caches from a single request', async () => {
    let actionsRequests = 0;

    mockGraphQL({
      request: { query: SHELL_STATE_QUERY, variables: feedListVariables },
      result: () => ({ data: shellStateData }),
    });
    mockGraphQL({
      request: { query: COMPLETED_USER_ACTIONS },
      result: () => {
        actionsRequests += 1;
        return { data: { actions: [] } };
      },
    });

    renderHook(() => useActions(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        queryClient.getQueryData(
          generateQueryKey(RequestKey.Actions, loggedUser),
        ),
      ).toEqual({ actions: shellStateData.actions, serverLoaded: true }),
    );

    expect(
      queryClient.getQueryData(
        generateQueryKey(RequestKey.UserStreak, loggedUser),
      ),
    ).toEqual(shellStateData.userStreak);
    expect(
      queryClient.getQueryData(
        generateQueryKey(RequestKey.Feeds, loggedUser, feedListVariables),
      ),
    ).toEqual(shellStateData.feedList);
    expect(actionsRequests).toEqual(0);
  });

  it('lets the individual queries run when the merged request fails', async () => {
    mockGraphQL({
      request: { query: SHELL_STATE_QUERY, variables: feedListVariables },
      result: () => ({ errors: [{ message: 'Forbidden' }] }),
    });
    mockGraphQL({
      request: { query: COMPLETED_USER_ACTIONS },
      result: () => ({ data: { actions: shellStateData.actions } }),
    });

    const { result } = renderHook(() => useActions(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isActionsFetched).toEqual(true));

    expect(result.current.actions).toEqual(shellStateData.actions);
  });

  it('skips seeding the feed list when the returned actions change the variables', async () => {
    let feedListRequests = 0;
    const settledFeedList = {
      pageInfo: { endCursor: null, hasNextPage: false },
      edges: [{ node: { id: 'f2', userId: loggedUser.id } }],
    };

    mockGraphQL({
      request: { query: SHELL_STATE_QUERY, variables: feedListVariables },
      result: () => ({
        data: {
          ...shellStateData,
          actions: [
            {
              type: ActionType.CompletedOnboarding,
              completedAt: '2024-01-01T00:00:00.000Z',
            },
          ],
        },
      }),
    });
    mockGraphQL({
      request: {
        query: FEED_LIST_QUERY,
        variables: { includeTagChipFeeds: true },
      },
      result: () => {
        feedListRequests += 1;
        return { data: { feedList: settledFeedList } };
      },
    });

    const { result } = renderHook(() => useFeeds(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.feeds).toEqual(settledFeedList));

    expect(
      queryClient.getQueryData(
        generateQueryKey(RequestKey.Feeds, loggedUser, feedListVariables),
      ),
    ).toBeUndefined();
    expect(feedListRequests).toEqual(1);
  });

  it('asks for the chip feeds up front when boot says the user is seeded', async () => {
    const seededUser = {
      ...loggedUser,
      flags: { tagChipFeedsSeededAt: '2026-01-01T00:00:00.000Z' },
    };
    const seededVariables = { includeTagChipFeeds: true };
    let feedListRequests = 0;

    mockGraphQL({
      request: { query: SHELL_STATE_QUERY, variables: seededVariables },
      result: () => ({ data: shellStateData }),
    });
    mockGraphQL({
      request: { query: FEED_LIST_QUERY, variables: seededVariables },
      result: () => {
        feedListRequests += 1;
        return { data: { feedList: shellStateData.feedList } };
      },
    });

    const { result } = renderHook(() => useFeeds(), {
      wrapper: ({ children }) => (
        <TestBootProvider client={queryClient} auth={{ user: seededUser }}>
          <ShellStateProvider>{children}</ShellStateProvider>
        </TestBootProvider>
      ),
    });

    await waitFor(() =>
      expect(result.current.feeds).toEqual(shellStateData.feedList),
    );

    expect(
      queryClient.getQueryData(
        generateQueryKey(RequestKey.Feeds, seededUser, seededVariables),
      ),
    ).toEqual(shellStateData.feedList);
    expect(feedListRequests).toEqual(0);
  });
});
