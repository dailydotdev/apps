import { act, renderHook } from '@testing-library/react';
import { revealShell, useShellScroll } from './useShellScroll';
import { scroll } from './constants';

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

describe('useShellScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    scrollTo(0);
    revealShell();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('stays shown inside the dead zone', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(scroll.deadZone - 10);
    });

    expect(result.current.p).toBe(0);
  });

  it('hides after reading past the tolerance and snaps when the scroll stops', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(90);
      scrollTo(100);
      scrollTo(140);
    });
    expect(result.current.p).toBeGreaterThan(0);
    expect(result.current.p).toBeLessThan(1);

    act(() => {
      jest.advanceTimersByTime(scroll.stop);
    });
    expect(result.current).toEqual({ p: 1, snapping: true });
  });

  it('comes back on a short scroll up, anywhere in the page', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
      jest.advanceTimersByTime(scroll.stop);
    });
    expect(result.current.p).toBe(1);

    act(() => {
      scrollTo(400 - scroll.revealTolerance - scroll.travel);
      jest.advanceTimersByTime(scroll.stop);
    });
    expect(result.current.p).toBe(0);
  });

  it('ignores a nudge smaller than the hide tolerance', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(90);
      scrollTo(100);
      scrollTo(90 + scroll.hideTolerance - 4);
    });

    expect(result.current.p).toBe(0);
  });

  it('reveals on demand', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
      jest.advanceTimersByTime(scroll.stop);
    });
    expect(result.current.p).toBe(1);

    act(() => {
      revealShell();
    });
    expect(result.current.p).toBe(0);
  });
});
