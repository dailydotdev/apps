import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { getLogContextStatic } from '../contexts/LogContext';
import type { LogContextData } from './log/useLogContextData';
import { LogEvent, TargetType } from '../lib/log';
import usePersistentContext from './usePersistentContext';
import { useGooglePreferredSource } from './useGooglePreferredSource';
import { usePreferredSource } from './usePreferredSource';

jest.mock('./usePersistentContext', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('./useGooglePreferredSource', () => ({
  useGooglePreferredSource: jest.fn(),
}));

const mockPersistent = jest.mocked(usePersistentContext);
const mockGoogle = jest.mocked(useGooglePreferredSource);

const LogContext = getLogContextStatic();

const setHasAdded = jest.fn();
const addPreferredSource = jest.fn();
const logEvent = jest.fn();

const eventsNamed = (name: string) =>
  logEvent.mock.calls
    .map(([event]) => event)
    .filter((event) => event.event_name === name);

const render = ({
  hasAdded = false,
  isPermanent = false,
  hasFailed = false,
}: {
  hasAdded?: boolean;
  isPermanent?: boolean;
  hasFailed?: boolean;
} = {}) => {
  mockPersistent.mockReturnValue([hasAdded, setHasAdded, true, false]);
  mockGoogle.mockReturnValue({
    isReady: !hasFailed,
    hasFailed,
    addPreferredSource,
  });

  return renderHook(
    () => usePreferredSource({ placement: 'post widgets', isPermanent }),
    {
      wrapper: ({ children }) => (
        <LogContext.Provider value={{ logEvent } as unknown as LogContextData}>
          {children}
        </LogContext.Provider>
      ),
    },
  );
};

describe('usePreferredSource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('goes quiet once the reader has added us', () => {
    const { result } = render({ hasAdded: true });

    expect(result.current.isEligible).toBe(false);
  });

  it('stays eligible after adding when permanent', () => {
    const { result } = render({ hasAdded: true, isPermanent: true });

    expect(result.current.isEligible).toBe(true);
  });

  it('records the answer optimistically on add', async () => {
    const { result } = render();

    result.current.onAdd();

    await waitFor(() => expect(addPreferredSource).toHaveBeenCalled());
    expect(setHasAdded).toHaveBeenCalledWith(true);
  });

  describe('analytics', () => {
    it('logs one impression tagged with the placement', () => {
      const { rerender } = render();

      rerender();

      expect(eventsNamed(LogEvent.ImpressionPreferredSource)).toEqual([
        {
          event_name: LogEvent.ImpressionPreferredSource,
          target_type: TargetType.PreferredSource,
          target_id: 'post widgets',
        },
      ]);
    });

    it('logs no impression for an ask it does not show', () => {
      render({ hasAdded: true });

      expect(eventsNamed(LogEvent.ImpressionPreferredSource)).toHaveLength(0);
    });

    it('logs the click against Google script route', () => {
      const { result } = render();

      result.current.onAdd();

      expect(eventsNamed(LogEvent.ClickPreferredSource)).toEqual([
        {
          event_name: LogEvent.ClickPreferredSource,
          target_type: TargetType.PreferredSource,
          target_id: 'post widgets',
          extra: JSON.stringify({ deeplink: false }),
        },
      ]);
    });

    it('marks a click that fell back to the deeplink', () => {
      const { result } = render({ hasFailed: true });

      result.current.onAdd();

      expect(eventsNamed(LogEvent.ClickPreferredSource)[0].extra).toBe(
        JSON.stringify({ deeplink: true }),
      );
    });

    it('logs a blocked script so it is not read as a refused ask', () => {
      render({ hasFailed: true });

      expect(eventsNamed(LogEvent.PreferredSourceBlocked)).toHaveLength(1);
    });

    it('logs nothing blocked while the script is working', () => {
      render();

      expect(eventsNamed(LogEvent.PreferredSourceBlocked)).toHaveLength(0);
    });
  });
});
