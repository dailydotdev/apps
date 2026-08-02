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
// The hook keys positions by history entry, so a fresh key per test keeps its
// module-level map from leaking between them.
let historyKey: string;
let historyKeyCount = 0;

const setPageHeight = (height: number) => {
  pageHeight = height;
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

    // The previous 1s budget expired here and dropped the user at the bottom of
    // the partially rendered feed.
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(scrollTo).not.toHaveBeenCalled();

    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, SAVED_POSITION);
  });

  it('leaves the user at the top when the page never grows tall enough', () => {
    saveFeedPosition();

    renderScrollRestoration();

    act(() => {
      jest.advanceTimersByTime(15000);
    });

    expect(scrollTo).not.toHaveBeenCalled();
    expect(window.scrollY).toBe(0);
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

    renderScrollRestoration();

    act(() => {
      window.dispatchEvent(new Event('touchmove'));
    });
    setPageHeight(FEED_HEIGHT);
    scrollUserTo(1200);

    // Remounting is the next back navigation to the same history entry.
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
});
