import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
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
import { useViewPost } from './useViewPost';

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

const graphqlError = { response: { data: null, errors: [{ message: 'no' }] } };
const networkError = new TypeError('Failed to fetch');

const renderViewPost = ({
  client,
  requestMethod,
  flag = true,
  isCompanion = false,
}: {
  client: QueryClient;
  requestMethod: jest.Mock;
  flag?: boolean;
  isCompanion?: boolean;
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
        initialData: streak,
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

  it('should roll the streak back when the API rejects the view', async () => {
    const requestMethod = jest.fn().mockRejectedValue(graphqlError);
    const { result } = renderViewPost({ client, requestMethod });

    await expect(result.current('p1')).rejects.toBe(graphqlError);

    expect(client.getQueryData<UserStreak>(streakKey)).toEqual(streak);
    expect(readStreakViewQueue()).toEqual([]);
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
});
