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
  celebrationFlag = false,
  streakGoal = null,
  isCompanion = false,
  initialStreak = streak,
  alerts,
  log,
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
}) => {
  client.setQueryData(REQUEST_PROTOCOL_KEY, { requestMethod, isCompanion });
  const gb = new GrowthBook({
    features: {
      streak_optimistic_view: { defaultValue: flag },
      streak_daily_celebration: { defaultValue: celebrationFlag },
      streak_goals: { defaultValue: !!streakGoal },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider
      client={client}
      auth={{ user }}
      gb={gb}
      settings={{ optOutReadingStreak: false, streakGoal }}
      alerts={alerts}
      log={log}
    >
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
