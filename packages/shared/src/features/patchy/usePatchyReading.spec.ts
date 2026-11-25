import { act, renderHook } from '@testing-library/react';
import { emitPatchyEvent } from './patchyEvents';
import { usePatchyReading } from './usePatchyReading';

beforeEach(() => {
  jest.useFakeTimers();
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  jest.useRealTimers();
});

it('reads along on a post that was open before he loaded', () => {
  window.history.pushState({}, '', '/posts/abc');
  const { result } = renderHook(() => usePatchyReading(true));

  expect(result.current).toBe(true);
});

it('starts on a post opening and stops once it is gone', () => {
  const { result } = renderHook(() => usePatchyReading(true));
  expect(result.current).toBe(false);

  window.history.pushState({}, '', '/posts/abc');
  act(() => emitPatchyEvent({ type: 'post_open' }));
  expect(result.current).toBe(true);

  window.history.pushState({}, '', '/');
  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(result.current).toBe(false);
});

it('stays off while he is off', () => {
  window.history.pushState({}, '', '/posts/abc');
  const { result } = renderHook(() => usePatchyReading(false));

  expect(result.current).toBe(false);
});
