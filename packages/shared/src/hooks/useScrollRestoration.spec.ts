import { act, renderHook } from '@testing-library/react';
import { useScrollRestoration } from './useScrollRestoration';

type RouterEvent = 'routeChangeStart' | 'hashChangeStart';

const routerListeners = new Map<RouterEvent, Set<() => void>>();

const mockRouter = {
  asPath: '/',
  events: {
    on: (event: RouterEvent, handler: () => void) => {
      const handlers = routerListeners.get(event) ?? new Set();
      handlers.add(handler);
      routerListeners.set(event, handlers);
    },
    off: (event: RouterEvent, handler: () => void) => {
      routerListeners.get(event)?.delete(handler);
    },
  },
};

jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

const FEED_PATH = '/';
const POST_PATH = '/posts/abc';
const VIEWPORT_HEIGHT = 780;
const FEED_POSITION = 5000;
const FEED_HEIGHT = 20000;
const POST_HEIGHT = 3000;

interface HistoryEntry {
  key: string;
  path: string;
}

let scrollTo: jest.Mock;
let pageHeight: number;
let notifyResize: (() => void) | undefined;
let rerenderHook: () => void;
// Positions are keyed by history entry in a module-level map, so fresh keys
// keep the tests from leaking into each other.
let entryCount = 0;

const createEntry = (path: string): HistoryEntry => {
  entryCount += 1;
  return { key: `entry-${entryCount}`, path };
};

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

const emitRouterEvent = (event: RouterEvent) =>
  act(() => {
    routerListeners.get(event)?.forEach((handler) => handler());
  });

const renderOn = (entry: HistoryEntry, height: number) => {
  window.history.replaceState({ key: entry.key }, '', entry.path);
  mockRouter.asPath = entry.path;
  setPageHeight(height);
  rerenderHook = renderHook(() => useScrollRestoration()).rerender;
};

// Next resets the scroll to the top when the destination commits, before any
// effect runs.
const commit = (entry: HistoryEntry, height: number) => {
  mockRouter.asPath = entry.path;
  setScrollY(0);
  setPageHeight(height);
  rerenderHook();
};

// A link: Next announces the change before it pushes the new entry.
const navigate = (path: string, height: number): HistoryEntry => {
  const entry = createEntry(path);
  emitRouterEvent('routeChangeStart');
  window.history.pushState({ key: entry.key }, '', entry.path);
  commit(entry, height);
  return entry;
};

// Back/forward: the browser is already on the destination entry when Next
// announces the change.
const traverse = (entry: HistoryEntry, height: number) => {
  window.history.replaceState({ key: entry.key }, '', entry.path);
  emitRouterEvent('routeChangeStart');
  commit(entry, height);
};

const startOnScrolledFeed = (): HistoryEntry => {
  const feed = createEntry(FEED_PATH);
  renderOn(feed, FEED_HEIGHT);
  scrollUserTo(FEED_POSITION);
  return feed;
};

beforeEach(() => {
  jest.useFakeTimers();
  routerListeners.clear();
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
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useScrollRestoration', () => {
  it('returns to the left position once the page is tall enough', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);

    traverse(feed, VIEWPORT_HEIGHT);
    act(() => {
      jest.advanceTimersByTime(2500);
    });
    expect(scrollTo).not.toHaveBeenCalled();

    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, FEED_POSITION);
  });

  it('saves the page being left on back and forward, not the destination', () => {
    const feed = startOnScrolledFeed();
    const post = navigate(POST_PATH, POST_HEIGHT);
    scrollUserTo(1200);

    traverse(feed, FEED_HEIGHT);
    advanceFrames();
    expect(window.scrollY).toBe(FEED_POSITION);

    traverse(post, POST_HEIGHT);
    advanceFrames();
    expect(window.scrollY).toBe(1200);
  });

  it('starts new navigations at the top', () => {
    startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    scrollUserTo(1200);

    navigate(FEED_PATH, FEED_HEIGHT);
    advanceFrames(2);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('keeps the saved position when leaving before it is restored', () => {
    const feed = startOnScrolledFeed();
    const post = navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, VIEWPORT_HEIGHT);

    traverse(post, POST_HEIGHT);
    traverse(feed, FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, FEED_POSITION);
  });

  it('ignores the router reset to the top while waiting for the page', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, VIEWPORT_HEIGHT);

    scrollUserTo(0);
    setPageHeight(FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, FEED_POSITION);
  });

  it('stops restoring once the user takes over the scroll', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, VIEWPORT_HEIGHT);

    act(() => {
      window.dispatchEvent(new Event('touchmove'));
    });
    setPageHeight(FEED_HEIGHT);
    advanceFrames(2);

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('remembers where the user took over instead of the old position', () => {
    const feed = startOnScrolledFeed();
    const post = navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, VIEWPORT_HEIGHT);

    setPageHeight(3000);
    scrollUserTo(1200);
    traverse(post, POST_HEIGHT);
    traverse(feed, FEED_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith(0, 1200);
  });

  it('abandons restoration before unrelated late page growth', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, VIEWPORT_HEIGHT);

    act(() => {
      jest.advanceTimersByTime(15000);
    });
    expect(jest.getTimerCount()).toBe(0);

    setPageHeight(FEED_HEIGHT);
    advanceFrames();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('returns to the reading position after following an in-page link', () => {
    const post = createEntry(POST_PATH);
    renderOn(post, POST_HEIGHT);
    scrollUserTo(1200);

    const comments = createEntry(`${POST_PATH}#comments`);
    emitRouterEvent('hashChangeStart');
    window.history.pushState({ key: comments.key }, '', comments.path);
    mockRouter.asPath = comments.path;
    setScrollY(2400);
    rerenderHook();

    window.history.replaceState({ key: post.key }, '', post.path);
    emitRouterEvent('hashChangeStart');
    commit(post, POST_HEIGHT);
    advanceFrames();

    expect(scrollTo).toHaveBeenCalledWith(0, 1200);
  });

  it('restores when the viewport shrinks enough to reach the position', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    traverse(feed, FEED_POSITION + VIEWPORT_HEIGHT - 100);
    advanceFrames();
    expect(scrollTo).not.toHaveBeenCalled();

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: VIEWPORT_HEIGHT - 100,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(scrollTo).toHaveBeenCalledWith(0, FEED_POSITION);
  });

  it('restores with bounded polling when ResizeObserver is unavailable', () => {
    const feed = startOnScrolledFeed();
    navigate(POST_PATH, POST_HEIGHT);
    const observerConstructor = global.ResizeObserver;
    Object.defineProperty(global, 'ResizeObserver', {
      value: undefined,
    });
    try {
      traverse(feed, VIEWPORT_HEIGHT);
      act(() => {
        jest.advanceTimersByTime(2500);
      });
      setPageHeight(FEED_HEIGHT);
      act(() => {
        jest.advanceTimersByTime(120);
      });

      expect(scrollTo).toHaveBeenCalledWith(0, FEED_POSITION);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      Object.defineProperty(global, 'ResizeObserver', {
        value: observerConstructor,
      });
    }
  });
});
