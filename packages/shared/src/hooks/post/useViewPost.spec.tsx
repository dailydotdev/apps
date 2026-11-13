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
import { dateFormatInTimezone } from '../../lib/timezones';
import { readStreakViewQueue } from '../../lib/streakViewQueue';
import { getStreakCelebratedKey } from '../../lib/streakDailyCelebration';
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
  flag = true,
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
  flag?: boolean;
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
      streak_optimistic_view: { defaultValue: flag },
      streak_daily_celebration: { defaultValue: celebrationFlag },
      streak_goals: { defaultValue: !!streakGoal },
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

  describe('daily celebration toast', () => {
    // 5 -> 6: not a milestone (the API raises the milestone modal on
    // Fibonacci days), so the daily toast is the one that celebrates it
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

    it('should toast once on the first counted read of the day', async () => {
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

      render(<>{getToast()?.message}</>);
      expect(screen.getByText('Day 6! See you tomorrow.')).toBeInTheDocument();
      expect(logEvent).toHaveBeenCalledTimes(1);
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.Impression,
        target_type: TargetType.StreakDailyCelebration,
        target_id: 6,
      });
      expect(localStorage.getItem(getStreakCelebratedKey(user.id))).toBe(
        dateFormatInTimezone(new Date(), 'yyyy-MM-dd', user.timezone),
      );

      // a second first-view the same day (replay, second tab) stays quiet
      client.setQueryData(TOAST_NOTIF_KEY, null);
      client.setQueryData(streakKey, dayFive);
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });

      await act(async () => {
        await result.current('p2');
      });

      await waitFor(() =>
        expect(client.getQueryData<UserStreak>(streakKey)).toMatchObject({
          current: 6,
        }),
      );
      expect(getToast()).toBeNull();
      expect(logEvent).toHaveBeenCalledTimes(1);
    });

    it('should celebrate the goal instead of the day when the read hits it', async () => {
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

      // day 6 of a 7-day goal: still the daily toast
      await act(async () => {
        await result.current('p1');
      });
      render(<>{getToast()?.message}</>);
      expect(screen.getByText('Day 6! See you tomorrow.')).toBeInTheDocument();

      // the next day's read lands on 7
      localStorage.clear();
      client.setQueryData(TOAST_NOTIF_KEY, null);
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
      expect(
        screen.queryByText('Day 7! See you tomorrow.'),
      ).not.toBeInTheDocument();
      expect(toast?.action?.copy).toBe('Set your next goal');
      expect(logEvent).toHaveBeenCalledWith({
        event_name: LogEvent.HitStreakGoal,
        target_type: TargetType.StreakGoal,
        target_id: 7,
        extra: JSON.stringify({ goal: 7 }),
      });
      expect(
        logEvent.mock.calls.filter(
          ([event]) =>
            event.target_type === TargetType.StreakDailyCelebration &&
            event.target_id === 7,
        ),
      ).toEqual([]);
      expect(localStorage.getItem(getStreakGoalHitKey(user.id))).toContain(
        '7:',
      );
    });

    it('should celebrate the goal when the refetch still has the pre-view streak', async () => {
      // the worker has not credited the read yet: userStreak still says 6,
      // but this read lands on 7, the goal
      const daySixYesterday = { ...daySix, lastViewAt: yesterday };
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySixYesterday } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        flag: false,
        celebrationFlag: true,
        streakGoal: 7,
        initialStreak: daySixYesterday,
      });

      await act(async () => {
        await result.current('p1');
      });

      render(<>{getToast()?.message}</>);
      expect(screen.getByText('Goal reached: 7 days!')).toBeInTheDocument();
      expect(
        screen.queryByText('Day 6! See you tomorrow.'),
      ).not.toBeInTheDocument();
    });

    it('should not toast when the milestone modal is due', async () => {
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: daySix } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
        initialStreak: dayFive,
        alerts: { alerts: { showStreakMilestone: true } },
      });

      await act(async () => {
        await result.current('p1');
      });

      expect(getToast()).toBeFalsy();
      expect(localStorage.getItem(getStreakCelebratedKey(user.id))).toBeNull();
    });

    it('should leave milestone days to the milestone modal', async () => {
      // 7 -> 8 is a Fibonacci day: the API flags showStreakMilestone for it
      mockGraphQL({
        request: { query: USER_STREAK_QUERY },
        result: { data: { userStreak: serverStreak } },
      });
      const { result } = renderViewPost({
        client,
        requestMethod: requestMethod(),
        celebrationFlag: true,
      });

      await act(async () => {
        await result.current('p1');
      });

      expect(getToast()).toBeFalsy();
    });

    describe('when the refetch still has the pre-view streak', () => {
      // the newView worker has not credited the read yet, so userStreak
      // returns yesterday's 7 although this read makes it 8
      const mockPreViewStreak = () =>
        mockGraphQL({
          request: { query: USER_STREAK_QUERY },
          result: { data: { userStreak: streak } },
        });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should not toast the stale count on a milestone day', async () => {
        mockPreViewStreak();
        const { result } = renderViewPost({
          client,
          requestMethod: requestMethod(),
          flag: false,
          celebrationFlag: true,
        });

        await act(async () => {
          await result.current('p1');
        });

        // 8 is a milestone, so the toast stays quiet instead of "Day 7!"
        expect(nock.isDone()).toBe(true);
        expect(getToast()).toBeFalsy();
        expect(
          localStorage.getItem(getStreakCelebratedKey(user.id)),
        ).toBeNull();
      });

      it('should not toast the stale count after the retry is stale too', async () => {
        jest.useFakeTimers({ advanceTimers: true });
        mockPreViewStreak();
        mockPreViewStreak();
        const { result } = renderViewPost({
          client,
          requestMethod: requestMethod(),
          celebrationFlag: true,
        });

        const promise = result.current('p1');
        await waitFor(() => expect(nock.pendingMocks()).toHaveLength(1));
        await act(async () => {
          await jest.advanceTimersByTimeAsync(STREAK_REFETCH_RETRY_DELAY_MS);
          await promise;
        });

        expect(nock.isDone()).toBe(true);
        expect(getToast()).toBeFalsy();
      });

      it('should toast the count this read lands on', async () => {
        mockGraphQL({
          request: { query: USER_STREAK_QUERY },
          result: { data: { userStreak: dayFive } },
        });
        const { result } = renderViewPost({
          client,
          requestMethod: requestMethod(),
          flag: false,
          celebrationFlag: true,
          initialStreak: dayFive,
        });

        await act(async () => {
          await result.current('p1');
        });

        render(<>{getToast()?.message}</>);
        expect(
          screen.getByText('Day 6! See you tomorrow.'),
        ).toBeInTheDocument();
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
        getFeatureValue.mock.calls.some(
          ([id]) => id === 'streak_daily_celebration',
        ),
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
        getFeatureValue.mock.calls.some(
          ([id]) => id === 'streak_daily_celebration',
        ),
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
