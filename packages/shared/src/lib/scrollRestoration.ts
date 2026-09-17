const RESTORE_TIMEOUT_MS = 10000;
const RESTORE_POLL_INTERVAL_MS = 100;
const MAX_SCROLL_POSITIONS = 200;

type ScrollPositionKind = 'page' | 'post-modal';

const scrollPositions = new Map<string, number>();
let activeRestoration: (() => void) | undefined;

const getScrollKey = (asPath: string, kind: ScrollPositionKind): string => {
  if (typeof window === 'undefined') {
    return `${kind}:${asPath}`;
  }

  const url = new URL(asPath, window.location.origin);
  const historyKey = (window.history.state as { key?: string } | null)?.key;
  return `${kind}:${url.pathname}${url.search}${url.hash}:${historyKey ?? ''}`;
};

export const getScrollPosition = (
  asPath: string,
  kind: ScrollPositionKind = 'page',
): number | undefined => scrollPositions.get(getScrollKey(asPath, kind));

export const saveScrollPosition = (
  asPath: string,
  position: number,
  kind: ScrollPositionKind = 'page',
): void => {
  const key = getScrollKey(asPath, kind);
  scrollPositions.delete(key);
  scrollPositions.set(key, position);
  if (scrollPositions.size > MAX_SCROLL_POSITIONS) {
    const oldestKey = scrollPositions.keys().next().value;
    if (oldestKey !== undefined) {
      scrollPositions.delete(oldestKey);
    }
  }
};

export const isScrollRestoring = (): boolean => !!activeRestoration;

export const cancelScrollRestoration = (): void => activeRestoration?.();

export const restoreScrollPosition = (target: number): (() => void) => {
  cancelScrollRestoration();
  const initialPosition = window.scrollY;
  const scrollKey = getScrollKey(window.location.href, 'page');
  const controller = new AbortController();
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let timeout = 0;
  let poll = 0;
  let stopped = false;

  const stop = () => {
    stopped = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(timeout);
    window.clearInterval(poll);
    observer?.disconnect();
    controller.abort();
    if (activeRestoration === stop) {
      activeRestoration = undefined;
    }
  };

  const restore = () => {
    if (stopped) {
      return;
    }
    if (getScrollKey(window.location.href, 'page') !== scrollKey) {
      stop();
      return;
    }

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll >= target) {
      window.scrollTo(0, target);
      stop();
    }
  };

  const scheduleRestore = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(restore);
  };

  activeRestoration = stop;
  timeout = window.setTimeout(stop, RESTORE_TIMEOUT_MS);
  if (typeof ResizeObserver === 'undefined') {
    poll = window.setInterval(scheduleRestore, RESTORE_POLL_INTERVAL_MS);
  } else {
    observer = new ResizeObserver(scheduleRestore);
    observer.observe(document.body);
  }

  const { signal } = controller;
  window.addEventListener('resize', restore, { signal });
  window.addEventListener('popstate', stop, { signal });
  window.addEventListener('wheel', stop, { passive: true, signal });
  window.addEventListener('touchmove', stop, { passive: true, signal });
  window.addEventListener('keydown', stop, { signal });
  window.addEventListener('mousedown', stop, { signal });
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY !== initialPosition) {
        stop();
        saveScrollPosition(window.location.href, window.scrollY);
      }
    },
    { passive: true, signal },
  );
  scheduleRestore();

  return stop;
};
