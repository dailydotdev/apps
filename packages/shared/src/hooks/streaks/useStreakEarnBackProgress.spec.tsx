import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { mockGraphQL } from '../../../__tests__/helpers/graphql';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type {
  StreakRecoverQuery,
  UserStreak,
  UserStreakRecoverData,
} from '../../graphql/users';
import { USER_STREAK_RECOVER_QUERY } from '../../graphql/users';
import { generateQueryKey, RequestKey } from '../../lib/query';
import * as toastHook from '../useToastNotification';
import {
  STREAK_EARN_BACK_WINDOW_MS,
  useStreakEarnBackProgress,
} from './useStreakEarnBackProgress';

const displayToast = jest.fn();
const logEvent = jest.fn();
const recoverKey = generateQueryKey(RequestKey.UserStreakRecover);

const offer: UserStreakRecoverData = {
  canRecover: true,
  cost: 100,
  oldStreakLength: 10,
  regularCost: 100,
  postsRead: 1,
  postsRequired: 3,
  earnBack: true,
};

const mockRecoverQuery = (streakRecover: UserStreakRecoverData) =>
  mockGraphQL<StreakRecoverQuery>({
    request: { query: USER_STREAK_RECOVER_QUERY },
    result: { data: { streakRecover } },
  });

const renderEarnBackHook = (client: QueryClient) =>
  renderHook(() => useStreakEarnBackProgress(), {
    wrapper: ({ children }) => (
      <TestBootProvider
        client={client}
        auth={{ user: loggedUser }}
        log={{ logEvent }}
      >
        {children}
      </TestBootProvider>
    ),
  });

describe('useStreakEarnBackProgress', () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient();
    displayToast.mockReset();
    logEvent.mockReset();
    jest.spyOn(toastHook, 'useToastNotification').mockReturnValue({
      displayToast,
      dismissToast: jest.fn(),
      subject: undefined,
    });
  });

  it('does nothing when no earn-back offer is cached', async () => {
    client.setQueryData<StreakRecoverQuery>(recoverKey, {
      streakRecover: { ...offer, earnBack: false },
    });
    const { result } = renderEarnBackHook(client);

    let earnedBack = true;
    await act(async () => {
      earnedBack = await result.current();
    });

    expect(earnedBack).toBe(false);
    expect(displayToast).not.toHaveBeenCalled();
  });

  it('refreshes the progress while the goal is not met', async () => {
    client.setQueryData<StreakRecoverQuery>(recoverKey, {
      streakRecover: offer,
    });
    mockRecoverQuery({ ...offer, postsRead: 2 });
    const { result } = renderEarnBackHook(client);

    let earnedBack = true;
    await act(async () => {
      earnedBack = await result.current();
    });

    expect(earnedBack).toBe(false);
    expect(
      client.getQueryData<StreakRecoverQuery>(recoverKey)?.streakRecover
        .postsRead,
    ).toBe(2);
    expect(displayToast).not.toHaveBeenCalled();
  });

  it('toasts when the read earned the streak back, leaving the log to the API', async () => {
    client.setQueryData<StreakRecoverQuery>(recoverKey, {
      streakRecover: { ...offer, postsRead: 2 },
    });
    mockRecoverQuery({
      ...offer,
      canRecover: false,
      oldStreakLength: 0,
      postsRead: 3,
    });
    const { result } = renderEarnBackHook(client);

    let earnedBack = false;
    await act(async () => {
      earnedBack = await result.current();
    });

    expect(earnedBack).toBe(true);
    expect(displayToast).toHaveBeenCalledWith('Your 10-day streak is back.');
    expect(logEvent).not.toHaveBeenCalled();
    // keeps the old length for the modal's success state
    expect(
      client.getQueryData<StreakRecoverQuery>(recoverKey)?.streakRecover,
    ).toMatchObject({ oldStreakLength: 10, postsRead: 3, canRecover: false });
  });

  describe('without a cached offer', () => {
    const setLastReset = (msAgo: number) =>
      client.setQueryData<Partial<UserStreak>>(
        generateQueryKey(RequestKey.UserStreak, loggedUser),
        {
          current: 1,
          lastReset: {
            at: new Date(Date.now() - msAgo).toISOString(),
            missedDate: null,
            timezone: null,
          },
        },
      );

    const read = async (result: { current: () => Promise<boolean> }) => {
      let earnedBack = false;
      await act(async () => {
        earnedBack = await result.current();
      });
      return earnedBack;
    };

    it('does not fetch when the last reset is outside the window', async () => {
      setLastReset(STREAK_EARN_BACK_WINDOW_MS + 60_000);
      const { result } = renderEarnBackHook(client);

      expect(await read(result)).toBe(false);
      expect(client.getQueryData(recoverKey)).toBeUndefined();
    });

    it('picks the offer back up after the cache was collected and celebrates the third read', async () => {
      setLastReset(60 * 60 * 1000);
      // The modal closed and its cache entry was collected
      client.removeQueries({ queryKey: recoverKey });
      const { result } = renderEarnBackHook(client);

      mockRecoverQuery({ ...offer, postsRead: 2 });
      expect(await read(result)).toBe(false);
      expect(
        client.getQueryData<StreakRecoverQuery>(recoverKey)?.streakRecover
          .postsRead,
      ).toBe(2);

      mockRecoverQuery({
        ...offer,
        canRecover: false,
        oldStreakLength: 0,
        postsRead: 3,
      });
      expect(await read(result)).toBe(true);
      expect(displayToast).toHaveBeenCalledWith('Your 10-day streak is back.');
    });
  });
});
