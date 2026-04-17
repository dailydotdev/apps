import { act, renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';

import {
  useManualScrollRestoration,
  useScrollRestoration,
} from './useScrollRestoration';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const routeEvents = {
  on: jest.fn(),
  off: jest.fn(),
};

let scrollY = 0;
let maxScrollTop = 0;
const originalScrollTo = window.scrollTo;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

beforeAll(() => {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => scrollY,
  });

  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => maxScrollTop + window.innerHeight,
  });

  window.scrollTo = jest.fn((x?: number | ScrollToOptions, y?: number) => {
    const targetScrollTop =
      typeof x === 'object'
        ? Number(x.top ?? 0)
        : Number(y ?? 0);

    scrollY = Math.min(targetScrollTop, maxScrollTop);
  });

  window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(performance.now()), 16);
  });

  window.cancelAnimationFrame = jest.fn((frameId: number) => {
    window.clearTimeout(frameId);
  });

  Object.defineProperty(window.history, 'scrollRestoration', {
    configurable: true,
    writable: true,
    value: 'auto',
  });
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.cancelAnimationFrame = originalCancelAnimationFrame;
});

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  window.sessionStorage.clear();
  scrollY = 0;
  maxScrollTop = 0;

  jest.mocked(useRouter).mockReturnValue({
    asPath: '/my-feed',
    events: routeEvents,
  } as unknown as ReturnType<typeof useRouter>);
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('useScrollRestoration', () => {
  it('persists the current route scroll position', () => {
    renderHook(() => useScrollRestoration());

    scrollY = 182;
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(window.sessionStorage.getItem('scroll-restoration:/my-feed')).toBe(
      '182',
    );
  });

  it('waits until the page is tall enough before restoring scroll', () => {
    jest.mocked(useRouter).mockReturnValue({
      asPath: '/popular',
      events: routeEvents,
    } as unknown as ReturnType<typeof useRouter>);

    window.sessionStorage.setItem('scroll-restoration:/popular', '240');

    renderHook(() => useScrollRestoration());

    act(() => {
      jest.advanceTimersByTime(32);
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(scrollY).toBe(0);

    maxScrollTop = 400;

    act(() => {
      jest.advanceTimersByTime(16);
    });

    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 240);
    expect(scrollY).toBe(240);
  });
});

describe('useManualScrollRestoration', () => {
  it('sets history scroll restoration to manual while mounted', () => {
    const { unmount } = renderHook(() => useManualScrollRestoration());

    expect(window.history.scrollRestoration).toBe('manual');

    unmount();

    expect(window.history.scrollRestoration).toBe('auto');
  });
});
