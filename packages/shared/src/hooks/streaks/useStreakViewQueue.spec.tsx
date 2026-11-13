import React from 'react';
import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { VIEW_POST_MUTATION } from '../../graphql/posts';
import { REQUEST_PROTOCOL_KEY } from '../../graphql/common';
import type { QueuedStreakView } from '../../lib/streakViewQueue';
import {
  enqueueStreakView,
  readStreakViewQueue,
} from '../../lib/streakViewQueue';
import { useStreakViewQueue } from './useStreakViewQueue';

const user = { ...loggedUser, timezone: 'Europe/Amsterdam' };
const DAY = 24 * 60 * 60 * 1000;

const queued = (
  postId: string,
  overrides: Partial<QueuedStreakView> = {},
): QueuedStreakView => ({
  postId,
  userId: user.id,
  at: Date.now(),
  timezone: user.timezone,
  ...overrides,
});

const renderQueue = ({
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
  const getFeatureValue = jest.spyOn(gb, 'getFeatureValue');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestBootProvider client={client} auth={{ user }} gb={gb}>
      {children}
    </TestBootProvider>
  );

  const view = renderHook(() => useStreakViewQueue(), { wrapper });
  const hasEvaluatedFlag = () =>
    getFeatureValue.mock.calls.some(([id]) => id === 'streak_optimistic_view');

  return { ...view, hasEvaluatedFlag };
};

const goOnline = () =>
  act(() => {
    window.dispatchEvent(new Event('online'));
  });

describe('useStreakViewQueue', () => {
  let client: QueryClient;

  beforeEach(() => {
    localStorage.clear();
    client = new QueryClient();
  });

  it('should replay the queued view once on reconnect and clear it', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    renderQueue({ client, requestMethod });
    expect(requestMethod).not.toHaveBeenCalled();

    enqueueStreakView(queued('p1'));
    goOnline();

    await waitFor(() => expect(readStreakViewQueue()).toEqual([]));
    expect(requestMethod).toHaveBeenCalledTimes(1);
    expect(requestMethod).toHaveBeenCalledWith(VIEW_POST_MUTATION, {
      id: 'p1',
    });

    goOnline();
    await act(() => Promise.resolve());
    expect(requestMethod).toHaveBeenCalledTimes(1);
  });

  it('should replay the queue on app load', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod });

    await waitFor(() => expect(readStreakViewQueue()).toEqual([]));
    expect(requestMethod).toHaveBeenCalledTimes(1);
  });

  it('should drop a view from a previous local day without sending it', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(queued('old', { at: Date.now() - 2 * DAY }));
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod });

    await waitFor(() => expect(readStreakViewQueue()).toEqual([]));
    expect(requestMethod).toHaveBeenCalledTimes(1);
    expect(requestMethod).toHaveBeenCalledWith(VIEW_POST_MUTATION, {
      id: 'p1',
    });
  });

  it('should keep the queue when the replay fails on the network', async () => {
    const requestMethod = jest
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod });

    await waitFor(() => expect(requestMethod).toHaveBeenCalledTimes(1));
    expect(readStreakViewQueue()).toHaveLength(1);
  });

  it('should drop a view the API can never count', async () => {
    const requestMethod = jest.fn().mockRejectedValue({
      response: {
        errors: [{ message: 'no', extensions: { code: 'NOT_FOUND' } }],
      },
    });
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod });

    await waitFor(() => expect(readStreakViewQueue()).toEqual([]));
  });

  it('should keep a view when the API fails with a transient GraphQL error', async () => {
    const requestMethod = jest.fn().mockRejectedValue({
      response: {
        errors: [
          { message: 'slow down', extensions: { code: 'RATE_LIMITED' } },
        ],
      },
    });
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod });

    await waitFor(() => expect(requestMethod).toHaveBeenCalledTimes(1));
    expect(readStreakViewQueue()).toHaveLength(1);
  });

  it('should drop a view from just before midnight once the local day changed', async () => {
    jest.useFakeTimers({ now: new Date('2026-01-13T00:10:00+01:00') });
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(
      queued('late', { at: new Date('2026-01-12T23:50:00+01:00').getTime() }),
    );

    try {
      renderQueue({ client, requestMethod });
      await act(() => Promise.resolve());
      await act(() => Promise.resolve());

      expect(requestMethod).not.toHaveBeenCalled();
      expect(readStreakViewQueue()).toEqual([]);
    } finally {
      jest.useRealTimers();
    }
  });

  it('should leave views queued by another user alone', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(queued('p1', { userId: 'someone-else' }));

    renderQueue({ client, requestMethod });

    await act(() => Promise.resolve());
    expect(requestMethod).not.toHaveBeenCalled();
    expect(readStreakViewQueue()).toHaveLength(1);
  });

  it('should never evaluate the flag for a user with an empty queue', async () => {
    const requestMethod = jest.fn();
    const { hasEvaluatedFlag } = renderQueue({ client, requestMethod });
    goOnline();

    await act(() => Promise.resolve());
    expect(hasEvaluatedFlag()).toBe(false);
    expect(requestMethod).not.toHaveBeenCalled();
  });

  it('should drain queued views without reading the flag', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(queued('p1'));

    const { hasEvaluatedFlag } = renderQueue({
      client,
      requestMethod,
      flag: false,
    });

    await waitFor(() => expect(readStreakViewQueue()).toEqual([]));
    expect(requestMethod).toHaveBeenCalledTimes(1);
    expect(hasEvaluatedFlag()).toBe(false);
  });

  it('should not replay from the companion', async () => {
    const requestMethod = jest
      .fn()
      .mockResolvedValue({ viewPost: { _: true } });
    enqueueStreakView(queued('p1'));

    renderQueue({ client, requestMethod, isCompanion: true });

    await act(() => Promise.resolve());
    expect(requestMethod).not.toHaveBeenCalled();
    expect(readStreakViewQueue()).toHaveLength(1);
  });
});
