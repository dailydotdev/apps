import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
import { subDays } from 'date-fns';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserStreak } from '../../graphql/users';
import { getReadingStreak, USER_STREAK_QUERY } from '../../graphql/users';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { REQUEST_PROTOCOL_KEY } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { DayOfWeek } from '../../lib/date';
import { readStreakViewQueue } from '../../lib/streakViewQueue';
import { STREAK_REFETCH_RETRY_DELAY_MS, useViewPost } from './useViewPost';

const user = { ...loggedUser, timezone: 'Europe/Amsterdam' };
const streakKey = generateQueryKey(RequestKey.UserStreak, user);
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

const streak: UserStreak = {
  max: 7,
  total: 20,
  current: 7,
  weekStart: DayOfWeek.Monday,
  lastViewAt: yesterday,
  freezesAvailable: 0,
};

const serverStreak: UserStreak = {
  ...streak,
  current: 8,
  max: 8,
  total: 21,
  lastViewAt: new Date(),
};

const graphqlError = (code: string) => ({
  response: { data: null, errors: [{ message: 'no', extensions: { code } }] },
});
const networkError = new TypeError('Failed to fetch');

const renderViewPost = ({
  client,
  requestMethod,
  flag = true,
  isCompanion = false,
  initialStreak = streak,
}: {
  client: QueryClient;
  requestMethod: jest.Mock;
  flag?: boolean;
  isCompanion?: boolean;
  initialStreak?: UserStreak;
}) => {
  client.setQueryData(REQUEST_PROTOCOL_KEY, { requestMethod, isCompanion });
  const gb = new GrowthBook({
    features: { streak_optimistic_view: { defaultValue: flag } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} auth={{ user }} gb={gb}>
      {children}
    </TestBootProvider>
  );

  return renderHook(
    () => {
      // the streak query the post page shell already has in cache
      useQuery({
        queryKey: streakKey,
        queryFn: getReadingStreak,
        initialData: initialStreak,
        staleTime: Infinity,
      });

      return useViewPost();
    },
    { wrapper },
  );
};

describe('useViewPost', () => {
  let client: QueryClient;

  beforeEach(() => {
    nock.cleanAll();
    localStorage.clear();
    client = new QueryClient();
  });

  it('should bump the cached streak before the response and keep it after success', async () => {
    let resolve: (value: unknown) => void;
    const requestMethod = jest.fn(
      () =>
        new Promise((res) => {
          resolve = res;
        }),
    );
    mockGraphQL({
      request: { query: USER_STREAK_QUERY },
      result: { data: { userStreak: serverStreak } },
    });
    const { result } = renderViewPost({ client, requestMethod });

    const promise = result.current('p1');

    await waitFor(() =>
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 8,
        total: 21,
        max: 8,
      }),
    );
    expect(requestMethod).toHaveBeenCalledWith(VIEW_POST_MUTATION, {
      id: 'p1',
    });

    await act(async () => {
      resolve!({ viewPost: { _: true } });
      await promise;
    });

    await waitFor(() =>
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 8,
        total: 21,
        max: 8,
        lastViewAt: serverStreak.lastViewAt.toISOString(),
      }),
    );
    expect(readStreakViewQueue()).toEqual([]);
  });

  it.each(['NOT_FOUND', 'FORBIDDEN', 'UNAUTHENTICATED'])(
    'should roll the streak back when the API rejects the view with %s',
    async (code) => {
      const error = graphqlError(code);
      const requestMethod = jest.fn().mockRejectedValue(error);
      const { result } = renderViewPost({ client, requestMethod });

      await expect(result.current('p1')).rejects.toBe(error);

      expect(client.getQueryData<UserStreak>(streakKey)).toEqual(streak);
      expect(readStreakViewQueue()).toEqual([]);
    },
  );

  it('should keep the streak and queue the view on a transient GraphQL error', async () => {
    const error = graphqlError('RATE_LIMITED');
    const requestMethod = jest.fn().mockRejectedValue(error);
    const { result } = renderViewPost({ client, requestMethod });

    await expect(result.current('p1')).rejects.toBe(error);

    expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
      current: 8,
      total: 21,
      max: 8,
    });
    expect(readStreakViewQueue()).toEqual([
      expect.objectContaining({ postId: 'p1', userId: user.id }),
    ]);
  });

  describe('when the refetch runs before the API credited the view', () => {
    // the newView worker has not written the streak yet, so userStreak still
    // returns yesterday's value
    const mockPreViewStreak = () =>
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: streak } },
      });

    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should keep the optimistic streak and take the retry once it is up to date', async () => {
      mockPreViewStreak();
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: { ...serverStreak, current: 9 } } },
      });
      const requestMethod = jest
        .fn()
        .mockResolvedValue({ viewPost: { _: true } });
      const { result } = renderViewPost({ client, requestMethod });

      let done = false;
      const promise = result.current('p1').then(() => {
        done = true;
      });

      await waitFor(() => expect(nock.pendingMocks()).toHaveLength(1));
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 8,
      });
      expect(done).toBe(false);

      await act(async () => {
        await jest.advanceTimersByTimeAsync(STREAK_REFETCH_RETRY_DELAY_MS);
        await promise;
      });

      expect(nock.isDone()).toBe(true);
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 9,
      });
    });

    it('should keep the optimistic streak when the retry is still stale', async () => {
      mockPreViewStreak();
      mockPreViewStreak();
      const requestMethod = jest
        .fn()
        .mockResolvedValue({ viewPost: { _: true } });
      const { result } = renderViewPost({ client, requestMethod });

      const promise = result.current('p1');

      await waitFor(() => expect(nock.pendingMocks()).toHaveLength(1));
      await act(async () => {
        await jest.advanceTimersByTimeAsync(STREAK_REFETCH_RETRY_DELAY_MS);
        await promise;
      });

      expect(nock.isDone()).toBe(true);
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 8,
        total: 21,
        max: 8,
      });
    });
  });

  it('should queue the view and keep the streak when the request never reaches the API', async () => {
    const requestMethod = jest.fn().mockRejectedValue(networkError);
    const { result } = renderViewPost({ client, requestMethod });

    await expect(result.current('p1')).rejects.toBe(networkError);

    expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
      current: 8,
      total: 21,
      max: 8,
    });
    expect(readStreakViewQueue()).toEqual([
      expect.objectContaining({
        postId: 'p1',
        userId: user.id,
        timezone: 'Europe/Amsterdam',
      }),
    ]);
  });

  it('should not persist the queue from the companion', async () => {
    const requestMethod = jest.fn().mockRejectedValue(networkError);
    const { result } = renderViewPost({
      client,
      requestMethod,
      isCompanion: true,
    });

    await expect(result.current('p1')).rejects.toBe(networkError);

    expect(readStreakViewQueue()).toEqual([]);
  });

  it('should only update the streak from the response when the flag is off', async () => {
    let resolve: (value: unknown) => void;
    const requestMethod = jest.fn(
      () =>
        new Promise((res) => {
          resolve = res;
        }),
    );
    mockGraphQL({
      request: { query: USER_STREAK_QUERY },
      result: { data: { userStreak: serverStreak } },
    });
    const { result } = renderViewPost({ client, requestMethod, flag: false });

    const promise = result.current('p1');

    await waitFor(() => expect(requestMethod).toHaveBeenCalledTimes(1));
    expect(client.getQueryData<UserStreak>(streakKey)).toEqual(streak);

    await act(async () => {
      resolve!({ viewPost: { _: true } });
      await promise;
    });

    await waitFor(() =>
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 8,
      }),
    );
  });

  it('should not queue a dropped view when the flag is off', async () => {
    const requestMethod = jest.fn().mockRejectedValue(networkError);
    const { result } = renderViewPost({ client, requestMethod, flag: false });

    await expect(result.current('p1')).rejects.toBe(networkError);

    expect(client.getQueryData<UserStreak>(streakKey)).toEqual(streak);
    expect(readStreakViewQueue()).toEqual([]);
  });

  it('should not bump the streak from the companion', async () => {
    const requestMethod = jest.fn(() => new Promise(() => {}));
    const { result } = renderViewPost({
      client,
      requestMethod,
      isCompanion: true,
    });

    result.current('p1');

    await waitFor(() => expect(requestMethod).toHaveBeenCalledTimes(1));
    expect(client.getQueryData<UserStreak>(streakKey)).toEqual(streak);
  });

  it('should not bump a streak last read before yesterday', async () => {
    const lastRead = { ...streak, lastViewAt: subDays(new Date(), 3) };
    const requestMethod = jest.fn(() => new Promise(() => {}));
    const { result } = renderViewPost({
      client,
      requestMethod,
      initialStreak: lastRead,
    });

    result.current('p1');

    await waitFor(() => expect(requestMethod).toHaveBeenCalledTimes(1));
    expect(client.getQueryData<UserStreak>(streakKey)).toEqual(lastRead);
  });

  it('should bump a reset streak to one', async () => {
    const reset = {
      ...streak,
      current: 0,
      lastViewAt: subDays(new Date(), 3),
    };
    const requestMethod = jest.fn(() => new Promise(() => {}));
    const { result } = renderViewPost({
      client,
      requestMethod,
      initialStreak: reset,
    });

    result.current('p1');

    await waitFor(() =>
      expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
        current: 1,
        total: 21,
        max: 7,
      }),
    );
  });

  it('should not queue a dropped view when today is already counted', async () => {
    const requestMethod = jest.fn().mockRejectedValue(networkError);
    const { result } = renderViewPost({
      client,
      requestMethod,
      initialStreak: serverStreak,
    });

    await expect(result.current('p1')).rejects.toBe(networkError);

    expect(readStreakViewQueue()).toEqual([]);
  });
});
