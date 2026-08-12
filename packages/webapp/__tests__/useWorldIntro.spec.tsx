import React from 'react';
import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get as getCache, set as setCache } from 'idb-keyval';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import {
  useWorldIntro,
  WORLD_INTRO_KEY,
} from '../components/world/useWorldIntro';

jest.mock('idb-keyval', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

const mockLogEvent = jest.fn();
jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/LogContext'),
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

const mockGet = getCache as jest.MockedFunction<typeof getCache>;
const mockSet = setCache as jest.MockedFunction<typeof setCache>;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const props = {
  userId: 'owner',
  isOwn: false,
  isEligible: true,
  isInRealm: false,
  hasDistrict: false,
};

const renderIntro = (overrides: Partial<typeof props> = {}) =>
  renderHook(
    (next: Partial<typeof props>) => useWorldIntro({ ...props, ...next }),
    {
      wrapper,
      initialProps: overrides,
    },
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue(undefined);
  mockSet.mockResolvedValue(undefined);
});

describe('useWorldIntro', () => {
  it('starts by pointing at the realms', async () => {
    const { result } = renderIntro();

    await waitFor(() => expect(result.current.step).toEqual('realm'));
  });

  it('moves to the districts once the reader has walked into a realm', async () => {
    const { result, rerender } = renderIntro();
    await waitFor(() => expect(result.current.step).toEqual('realm'));

    rerender({ isInRealm: true });

    expect(result.current.step).toEqual('district');
  });

  /* Back out of a realm and the hint follows you, because it describes where you
     are standing rather than how far through a tour you are. */
  it('follows the reader back out to world scale', async () => {
    const { result, rerender } = renderIntro({ isInRealm: true });
    await waitFor(() => expect(result.current.step).toEqual('district'));

    rerender({ isInRealm: false });

    expect(result.current.step).toEqual('realm');
  });

  /* The whole reason the hook waits on `isFetched`. Without it a reader who has
     already been through this gets a frame of the bar on every visit, because
     the stored flag arrives from IndexedDB a tick after the first render. */
  it('shows nothing at all before the stored flag has been read back', () => {
    const { result } = renderIntro();

    expect(result.current.step).toBeNull();
  });

  it('never comes back for a reader who has already seen it', async () => {
    mockGet.mockResolvedValue(true);
    const { result } = renderIntro();

    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(WORLD_INTRO_KEY));
    expect(result.current.step).toBeNull();
  });

  it('retires itself for good once a district is opened', async () => {
    const { result, rerender } = renderIntro({ isInRealm: true });
    await waitFor(() => expect(result.current.step).toEqual('district'));

    rerender({ isInRealm: true, hasDistrict: true });

    expect(result.current.step).toBeNull();
    await waitFor(() =>
      expect(mockSet).toHaveBeenCalledWith(WORLD_INTRO_KEY, true),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.WorldIntro,
        extra: JSON.stringify({ is_own: false, outcome: 'completed' }),
      }),
    );
  });

  it('remembers a dismissal', async () => {
    const { result } = renderIntro();
    await waitFor(() => expect(result.current.step).toEqual('realm'));

    act(() => result.current.dismiss());

    await waitFor(() =>
      expect(mockSet).toHaveBeenCalledWith(WORLD_INTRO_KEY, true),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.WorldIntro,
        extra: JSON.stringify({ is_own: false, outcome: 'dismissed' }),
      }),
    );
  });

  /* A reader who never saw the bar has not been taught anything, so burning the
     flag on them would mean they never do. This is reachable: the sequence is
     suppressed while riding, while immersive and while the bench is open. */
  it('does not burn the flag on a reader it never spoke to', async () => {
    const { result } = renderIntro({ isEligible: false, hasDistrict: true });

    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    expect(result.current.step).toBeNull();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('reports itself once when it first appears', async () => {
    const { result } = renderIntro();
    await waitFor(() => expect(result.current.step).toEqual('realm'));

    expect(
      mockLogEvent.mock.calls.filter(
        ([{ event_name: name }]) => name === LogEvent.WorldIntro,
      ),
    ).toHaveLength(1);
  });
});
