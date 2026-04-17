import { useEffect } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};
const scrollPositionPrefix = 'scroll-restoration:';
const maxRestoreAttempts = 180;
const restoreTolerancePx = 1;

const getScrollPositionKey = (route: string): string =>
  `${scrollPositionPrefix}${route}`;

const getMaxScrollTop = (): number =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const persistScrollPosition = (
  scrollPositionKey: string,
  scrollPosition: number,
): void => {
  const normalizedPosition = Math.max(0, Math.round(scrollPosition));

  scrollPositions[scrollPositionKey] = normalizedPosition;
  window.sessionStorage.setItem(scrollPositionKey, `${normalizedPosition}`);
};

const getStoredScrollPosition = (scrollPositionKey: string): number => {
  const inMemoryPosition = scrollPositions[scrollPositionKey];
  if (typeof inMemoryPosition === 'number') {
    return inMemoryPosition;
  }

  const storedValue = window.sessionStorage.getItem(scrollPositionKey);
  if (!storedValue) {
    return 0;
  }

  const storedPosition = Number(storedValue);
  if (!Number.isFinite(storedPosition) || storedPosition < 0) {
    return 0;
  }

  scrollPositions[scrollPositionKey] = storedPosition;

  return storedPosition;
};

export const useScrollRestoration = (): void => {
  const { asPath, events } = useRouter();
  const scrollPositionKey = getScrollPositionKey(asPath);

  useEffect(() => {
    const persistCurrentScrollPosition = () => {
      persistScrollPosition(scrollPositionKey, window.scrollY);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistCurrentScrollPosition();
      }
    };

    window.addEventListener('scroll', persistCurrentScrollPosition, {
      passive: true,
    });
    window.addEventListener('beforeunload', persistCurrentScrollPosition);
    window.addEventListener('pagehide', persistCurrentScrollPosition);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    events.on('routeChangeStart', persistCurrentScrollPosition);

    return () => {
      persistCurrentScrollPosition();
      window.removeEventListener('scroll', persistCurrentScrollPosition);
      window.removeEventListener('beforeunload', persistCurrentScrollPosition);
      window.removeEventListener('pagehide', persistCurrentScrollPosition);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      events.off('routeChangeStart', persistCurrentScrollPosition);
    };
  }, [events, scrollPositionKey]);

  useEffect(() => {
    const savedScrollPosition = getStoredScrollPosition(scrollPositionKey);
    let attempts = 0;
    let frameId = 0;

    const restoreScrollPosition = () => {
      const maxScrollTop = getMaxScrollTop();
      const canFullyRestore = savedScrollPosition <= maxScrollTop;
      const isLastAttempt = attempts >= maxRestoreAttempts;

      if (savedScrollPosition === 0 || canFullyRestore || isLastAttempt) {
        const targetScrollTop = Math.min(savedScrollPosition, maxScrollTop);
        window.scrollTo(0, targetScrollTop);

        if (
          Math.abs(window.scrollY - targetScrollTop) <= restoreTolerancePx ||
          isLastAttempt
        ) {
          return;
        }
      }

      attempts += 1;
      frameId = window.requestAnimationFrame(restoreScrollPosition);
    };

    const scheduleRestore = () => {
      attempts = 0;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(restoreScrollPosition);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) {
        return;
      }

      scheduleRestore();
    };

    scheduleRestore();
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [scrollPositionKey]);
};

export const useManualScrollRestoration = (): void => {
  useEffect(() => {
    if (typeof window.history?.scrollRestoration !== 'undefined') {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if (typeof window.history?.scrollRestoration !== 'undefined') {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);
};
