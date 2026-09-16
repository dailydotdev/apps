import { act, renderHook } from '@testing-library/react';
import { useScrollRestoration } from './useScrollRestoration';

const mockRouter = { asPath: '/' };

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

const FEED_PATH = '/';
const VIEWPORT_HEIGHT = 780;
const SAVED_POSITION = 5000;
const FEED_HEIGHT = 20000;

let scrollTo: jest.Mock;
let pageHeight: number;
let notifyResize: (() => void) | undefined;
// The hook keys positions by history entry, so a fresh key per test keeps its
// module-level map from leaking between them.
let historyKey: string;
let historyKeyCount = 0;

const setPageHeight = (height: number) => {
  pageHeight = height;
  notifyResize?.();
};

const setScrollY = (position: number) => {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: position,
  });
};

const scrollUserTo = (position: number) => {
  setScrollY(position);
  window.dispatchEvent(new Event('scroll'));
};

// One rAF tick, driven by the fake timers backing requestAnimationFrame.
const advanceFrames = (count = 1) =>
  act(() => {
    jest.advanceTimersByTime(16 * count);
  });

const renderScrollRestoration = () => renderHook(() => useScrollRestoration());

beforeEach(() => {
  jest.useFakeTimers();
  notifyResize = undefined;
  jest.mocked(ResizeObserver).mockImplementation((callback) => {
    const observer = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(() => {
        notifyResize = undefined;
      }),
    };
    notifyResize = () => callback([], observer);
    return observer;
  });

  historyKeyCount += 1;
  historyKey = `feed-entry-${historyKeyCount}`;
  window.history.replaceState({ key: historyKey }, '', FEED_PATH);
  mockRouter.asPath = FEED_PATH;

  scrollTo = jest.fn((_left: number, top: number) => setScrollY(top));
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: scrollTo,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: VIEWPORT_HEIGHT,
  });
  Object.defineProperty(document.documentElement, 'scrollHeight', {
    configurable: true,
    get: () => pageHeight,
  });

  setScrollY(0);
  setPageHeight(VIEWPORT_HEIGHT);
});

afterEach(() => {
  jest.useRealTimers();
});

// The mobile flow: scroll the feed, open a post, then come back to a feed that
// only reaches its full height once the cached pages have reconciled.
const saveFeedPosition = () => {
  setPageHeight(FEED_HEIGHT);
  const { unmount } = renderScrollRestoration();

  scrollUserTo(SAVED_POSITION);
  unmount();

  // Next.js resets the scroll to the top when the next route commits.
  setScrollY(0);
  setPageHeight(VIEWPORT_HEIGHT);
};

describe('useScrollRestoration', () => {
  it('waits for the feed to render before restoring the saved position', () => {
    saveFeedPosition();

    renderScrollRestoration();

    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(scrollTo).not.toHaveBeenCalled();

    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);
  });

  it('waits without polling when the page is too short', () => {
    saveFeedPosition();

    renderScrollRestoration();

    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.scrollY).toBe(0);
    expect(jest.getTimerCount()).toBe(0);

    setPageHeight(FEED_HEIGHT);
    advanceFrames();
    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);
  });

  it('keeps the saved position when the router resets the scroll to the top', () => {
    saveFeedPosition();

    const { unmount } = renderScrollRestoration();

    // Next's reset-to-top lands while we are still waiting for the feed height.
    scrollUserTo(0);
    advanceFrames();

    setPageHeight(FEED_HEIGHT);
    advanceFrames();
    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);

    // The reset must not have overwritten the entry for the next visit back.
    unmount();
    scrollTo.mockClear();
    setScrollY(0);
    setPageHeight(VIEWPORT_HEIGHT);

    renderScrollRestoration();
    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);
  });

  it('stops restoring once the user takes over the scroll', () => {
    saveFeedPosition();

    renderScrollRestoration();

    act(() => {
      window.dispatchEvent(new Event('touchmove'));
    });

    setPageHeight(FEED_HEIGHT);
    advanceFrames(2);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('records the position again once the user takes over', () => {
    saveFeedPosition();

    const { unmount } = renderScrollRestoration();

    act(() => {
      window.dispatchEvent(new Event('touchmove'));
    });
    setPageHeight(FEED_HEIGHT);
    scrollUserTo(1200);

    // Remounting is the next back navigation to the same history entry.
    unmount();
    setPageHeight(VIEWPORT_HEIGHT);
    setScrollY(0);
    renderScrollRestoration();
    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, 1200);
  });

  it('does not restore when the user never scrolled the page', () => {
    setPageHeight(FEED_HEIGHT);

    renderScrollRestoration();
    advanceFrames(2);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('cancels a pending restoration when leaving the feed', () => {
    saveFeedPosition();
    const { unmount } = renderScrollRestoration();
    advanceFrames();
    setPageHeight(FEED_HEIGHT);
    unmount();
    advanceFrames();

    expect(scrollTo).not.toHaveBeenCalled();
    expect(notifyResize).toBeUndefined();
  });

  it('restores when the viewport shrinks enough to reach the saved position', () => {
    saveFeedPosition();
    setPageHeight(SAVED_POSITION + VIEWPORT_HEIGHT - 100);
    renderScrollRestoration();
    advanceFrames();
    expect(scrollTo).not.toHaveBeenCalled();

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: VIEWPORT_HEIGHT - 100,
    });
    act(() => window.dispatchEvent(new Event('resize')));

    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);
  });
});
