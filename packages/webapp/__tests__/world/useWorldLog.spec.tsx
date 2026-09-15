import { renderHook, waitFor } from '@testing-library/react';
import { LogEvent } from '@dailydotdev/shared/src/lib/log';
import { useWorldLog } from '../../components/world/useWorldLog';
import type { WorldState } from '../../components/world/worldState';

const mockLogEvent = jest.fn();
jest.mock('@dailydotdev/shared/src/contexts/LogContext', () => ({
  ...jest.requireActual('@dailydotdev/shared/src/contexts/LogContext'),
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

type UseWorldLogProps = Parameters<typeof useWorldLog>[0];

const state: WorldState = {
  status: 'loading',
  progress: 0,
  message: '',
  playing: false,
  speed: 1,
  day: 0,
  totalDays: 1,
  rank: [],
};

const props: UseWorldLogProps = {
  userId: 'reader-one',
  isOwn: false,
  isLite: false,
  isSettled: true,
  isPrivate: false,
  isUnbuilt: false,
  isReady: false,
  failure: 'districts query failed',
  failureKind: 'data',
  state,
  districts: [],
};

const events = () => mockLogEvent.mock.calls.map(([event]) => event);

const eventsByName = (eventName: LogEvent) =>
  events().filter(({ event_name: name }) => name === eventName);

const extraOf = (event: { extra?: string }) =>
  JSON.parse(event.extra ?? '{}') as Record<string, unknown>;

const renderWorldLog = (overrides: Partial<UseWorldLogProps> = {}) =>
  renderHook(
    (next: Partial<UseWorldLogProps>) => useWorldLog({ ...props, ...next }),
    { initialProps: overrides },
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useWorldLog', () => {
  it('logs a boot failure kind exactly once per reader', async () => {
    renderWorldLog();

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(eventsByName(LogEvent.WorldView)).toHaveLength(1);
    expect(failure).toEqual(
      expect.objectContaining({
        event_name: LogEvent.WorldBootFailed,
        target_id: 'reader-one',
      }),
    );
    expect(extraOf(failure)).toEqual(
      expect.objectContaining({
        is_own: false,
        is_lite: false,
        reason: 'districts query failed',
        kind: 'data',
      }),
    );
  });

  /* The real ordering for a browser with no WebGL: the engine constructor throws
     in the mount commit, long before the districts query comes back, so the
     failure is already standing when the view is finally logged. */
  it('logs the outcome for a failure that lands before the world settles', async () => {
    const pending = {
      isSettled: false,
      isReady: false,
      failure: 'Error creating WebGL context.',
      failureKind: 'unsupported' as const,
    };
    const { rerender } = renderWorldLog(pending);

    await waitFor(() => expect(events()).toHaveLength(0));

    rerender({ ...pending, isSettled: true });

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );
    expect(eventsByName(LogEvent.WorldView)).toHaveLength(1);

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(extraOf(failure)).toEqual(
      expect.objectContaining({
        kind: 'unsupported',
        reason: 'Error creating WebGL context.',
      }),
    );
  });

  it('keeps a failure with no kind out of the engine bucket', async () => {
    renderWorldLog({ failureKind: undefined });

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    const [failure] = eventsByName(LogEvent.WorldBootFailed);
    expect(extraOf(failure).kind).toEqual('unknown');
  });

  it('fires the boot failure again after soft navigation to another world', async () => {
    const { rerender } = renderWorldLog();
    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(1),
    );

    rerender({
      userId: 'reader-two',
      failure: 'Error creating WebGL context.',
      failureKind: 'context-limit',
    });

    await waitFor(() =>
      expect(eventsByName(LogEvent.WorldBootFailed)).toHaveLength(2),
    );

    const failures = eventsByName(LogEvent.WorldBootFailed);
    expect(failures.map(({ target_id: targetId }) => targetId)).toEqual([
      'reader-one',
      'reader-two',
    ]);
    expect(failures.map((event) => extraOf(event).kind)).toEqual([
      'data',
      'context-limit',
    ]);
  });
});
