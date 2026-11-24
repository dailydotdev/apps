import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import nock from 'nock';
import { subDays } from 'date-fns';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { UserStreak } from '../../graphql/users';
import type { StreakGoal } from '../../graphql/settings';
import { getReadingStreak, USER_STREAK_QUERY } from '../../graphql/users';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { REQUEST_PROTOCOL_KEY } from '../../graphql/common';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { DayOfWeek } from '../../lib/date';
import { readStreakViewQueue } from '../../lib/streakViewQueue';
import type { ToastNotification } from '../useToastNotification';
import { TOAST_NOTIF_KEY } from '../useToastNotification';
import { LogEvent, TargetType } from '../../lib/log';
import { getStreakGoalHitKey } from '../../lib/streakGoal';
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
  celebrationFlag = false,
  streakGoal = null,
  isCompanion = false,
  initialStreak = streak,
  alerts,
  log,
  settings,
}: {
  client: QueryClient;
  requestMethod: jest.Mock;
  celebrationFlag?: boolean;
  streakGoal?: StreakGoal | null;
  isCompanion?: boolean;
  initialStreak?: UserStreak;
  alerts?: ComponentProps<typeof TestBootProvider>['alerts'];
  log?: ComponentProps<typeof TestBootProvider>['log'];
  settings?: ComponentProps<typeof TestBootProvider>['settings'];
}) => {
  client.setQueryData(REQUEST_PROTOCOL_KEY, { requestMethod, isCompanion });
  const gb = new GrowthBook({
    features: {
      streak_improvements: { defaultValue: celebrationFlag || !!streakGoal },
    },
  });
  const getFeatureValue = jest.spyOn(gb, 'getFeatureValue');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider
      client={client}
      auth={{ user }}
      gb={gb}
      settings={{ optOutReadingStreak: false, streakGoal, ...settings }}
      alerts={alerts}
      log={log}
    >
      {children}
    </TestBootProvider>
  );

  const view = renderHook(
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

  return { ...view, getFeatureValue };
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

    // a re-read of a post viewed in the past week: newView skips it, so the
    // streak never moves
    it('should put the server streak back when the retry is still stale', async () => {
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
        current: 7,
        total: 20,
        max: 7,
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

  describe('streak celebration toasts', () => {
    // 5 -> 6: neither a milestone (the API raises the milestone modal on
    // Fibonacci days) nor a goal
    const dayFive: UserStreak = { ...streak, current: 5, max: 5 };
    const daySix: UserStreak = {
      ...dayFive,
      current: 6,
      max: 6,
      total: 21,
      lastViewAt: new Date(),
    };
    const requestMethod = () =>
      jest.fn().mockResolvedValue({ viewPost: { _: true } });
    const getToast = () =>
      client.getQueryData<ToastNotification | null>(TOAST_NOTIF_KEY);

    it('should not toast an ordinary streak day', async () => {
      const logEvent = jest.fn();
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        initialStreak: dayFive,
        log: { logEvent },
      });

      await act(async () => {
        await result.current('p1');
      });

      await waitFor(() =>
        expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
          current: 6,
        }),
      );
      expect(getToast()).toBeFalsy();
      expect(logEvent).not.toHaveBeenCalled();
    });

    it('should celebrate the goal when the read hits it', async () => {
      const logEvent = jest.fn();
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        streakGoal: 7,
        initialStreak: dayFive,
        log: { logEvent },
      });

      // day 6 of a 7-day goal: no toast
      await act(async () => {
        await result.current('p1');
      });
      expect(getToast()).toBeFalsy();

      // the next day's read lands on 7
      client.setQueryData(streakKey, { ...daySix, lastViewAt: yesterday });
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: {
          data: {
            userStreak: { ...daySix, current: 7, max: 7, total: 22 },
          },
        },
      });

      await act(async () => {
        await result.current('p2');
      });

      const toast = getToast();
      render(<>{toast?.message}</>);
      expect(screen.getByText('Goal reached: 7 days!')).toBeInTheDocument();
      expect(toast?.action?.copy).toBe('Set your next goal');
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.HitStreakGoal,
        target_type: TargetType.StreakGoal,
        target_id: 7,
        extra: JSON.stringify({ goal: 7 }),
      });
      expect(localStorage.getItem(getStreakGoalHitKey(user.id))).toContain(
        '7:',
      );
    });

    it('should celebrate the goal once the retry confirms the read', async () => {
      // the worker has not credited the read yet: userStreak still says 6,
      // and the retry confirms it lands on 7, the goal
      jest.useFakeTimers({ advanceTimers: true });
      const daySixYesterday = { ...daySix, lastViewAt: yesterday };
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySixYesterday } },
      });
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: {
          data: {
            userStreak: {
              ...daySix,
              current: 7,
              max: 7,
              total: 22,
              lastViewAt: new Date(),
            },
          },
        },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        streakGoal: 7,
        initialStreak: daySixYesterday,
      });

      const promise = result.current('p1');
      await waitFor(() => expect(nock.pendingMocks()).toHaveLength(1));
      await act(async () => {
        await jest.advanceTimersByTimeAsync(STREAK_REFETCH_RETRY_DELAY_MS);
        await promise;
      });
      jest.useRealTimers();

      expect(nock.isDone()).toBe(true);
      render(<>{getToast()?.message}</>);
      expect(screen.getByText('Goal reached: 7 days!')).toBeInTheDocument();
    });

    describe('when the refetch still has the pre-view streak', () => {
      // the newView worker has not credited the read yet, or skipped it (a
      // post viewed in the past week), so userStreak still returns day 5
      const mockPreViewStreak = () =>
        mockGraphQL({
          request: { query: USER_STREAK_QUERY },
          result: { data: { userStreak: dayFive } },
        });
      const renderAndView = async (
        props: Partial<Parameters<typeof renderViewPost>[0]> = {},
      ) => {
        const { result } = renderViewPost({
          client,
          requestMethod: requestMethod(),
          streakGoal: 6,
          initialStreak: dayFive,
          ...props,
        });

        const promise = result.current('p1');
        await waitFor(() => expect(nock.pendingMocks()).toHaveLength(1));
        await act(async () => {
          await jest.advanceTimersByTimeAsync(STREAK_REFETCH_RETRY_DELAY_MS);
          await promise;
        });
      };

      beforeEach(() => {
        jest.useFakeTimers({ advanceTimers: true });
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should not toast a read the API never counted', async () => {
        mockPreViewStreak();
        mockPreViewStreak();

        await renderAndView();

        expect(nock.isDone()).toBe(true);
        expect(getToast()).toBeFalsy();
        expect(localStorage.getItem(getStreakGoalHitKey(user.id))).toBeNull();
      });

      it('should not toast a guessed count after a gap', async () => {
        mockPreViewStreak();
        mockPreViewStreak();

        await renderAndView({
          initialStreak: { ...dayFive, lastViewAt: subDays(new Date(), 3) },
        });

        expect(nock.isDone()).toBe(true);
        expect(getToast()).toBeFalsy();
      });

      it('should celebrate the goal once the retry confirms the read', async () => {
        mockPreViewStreak();
        mockGraphQL({
          request: { query: USER_STREAK_QUERY },
          result: { data: { userStreak: daySix } },
        });

        await renderAndView();

        expect(nock.isDone()).toBe(true);
        render(<>{getToast()?.message}</>);
        expect(screen.getByText('Goal reached: 6 days!')).toBeInTheDocument();
      });
    });

    it('should not evaluate the flag for users who opted out of streaks', async () => {
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });
      const { result, getFeatureValue } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        initialStreak: dayFive,
        settings: { optOutReadingStreak: true },
      });

      await act(async () => {
        await result.current('p1');
      });

      expect(getToast()).toBeFalsy();
      expect(
        getFeatureValue.mock.calls.some(([id]) => id === 'streak_improvements'),
      ).toBe(false);
    });

    it('should not evaluate the flag while settings are loading', async () => {
      const { getFeatureValue } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        settings: { loadedSettings: false },
      });

      await act(() => Promise.resolve());
      expect(
        getFeatureValue.mock.calls.some(([id]) => id === 'streak_improvements'),
      ).toBe(false);
    });

    it('should not toast when the flag is off', async () => {
      const logEvent = jest.fn();
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        initialStreak: dayFive,
        settings: { streakGoal: 6 },
        log: { logEvent },
      });

      await act(async () => {
        await result.current('p1');
      });

      await waitFor(() =>
        expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
          current: 6,
        }),
      );
      expect(getToast()).toBeFalsy();
      expect(logEvent).not.toHaveBeenCalled();
    });
  });
});
