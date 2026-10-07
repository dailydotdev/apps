import { act, renderHook } from '@testing-library/react';
import { revealShell, useShellScroll } from './useShellScroll';
import { scroll } from './constants';

const scrollTo = (y: number) => {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
  window.dispatchEvent(new Event('scroll'));
};

describe('useShellScroll', () => {
  beforeEach(() => {
    scrollTo(0);
    revealShell();
  });

  it('stays shown inside the dead zone', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(scroll.deadZone - 10);
    });

    expect(result.current.p).toBe(0);
  });

  it('hides as a whole once the reading passes the tolerance', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(scroll.deadZone - 6);
      scrollTo(scroll.deadZone + scroll.hideTolerance - 10);
    });
    expect(result.current.p).toBe(0);

    act(() => {
      scrollTo(scroll.deadZone + scroll.hideTolerance + 4);
    });
    expect(result.current).toEqual({ p: 1 });
  });

  it('never reports a value between shown and hidden', () => {
    const { result } = renderHook(() => useShellScroll());
    const seen = new Set<number>();

    act(() => {
      [100, 110, 120, 130, 140, 160, 200, 190, 185, 180, 170].forEach((y) => {
        scrollTo(y);
        seen.add(result.current.p);
      });
    });

    expect([...seen].every((p) => p === 0 || p === 1)).toBe(true);
  });

  it('comes back on a short scroll up, anywhere in the page', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
    });
    expect(result.current.p).toBe(1);

    act(() => {
      scrollTo(400 - scroll.revealTolerance - 1);
    });
    expect(result.current.p).toBe(0);
  });

  it('keeps its state while a sheet pins the page', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
    });
    expect(result.current.p).toBe(1);

    document.body.style.position = 'fixed';
    act(() => {
      scrollTo(0);
    });
    expect(result.current.p).toBe(1);
    document.body.style.removeProperty('position');
  });

  it('ignores a wobble smaller than the tolerances', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
      scrollTo(400 - scroll.revealTolerance + 2);
      scrollTo(400);
    });

    expect(result.current.p).toBe(1);
  });

  it('reveals on demand', () => {
    const { result } = renderHook(() => useShellScroll());

    act(() => {
      scrollTo(200);
      scrollTo(400);
    });
    expect(result.current.p).toBe(1);

    act(() => {
      revealShell();
    });
    expect(result.current.p).toBe(0);
  });
});
