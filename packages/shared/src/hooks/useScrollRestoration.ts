import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

const SESSION_STORAGE_KEY = 'scrollPositions';
// Long sessions accumulate one entry per history entry, so keep the map bounded.
const MAX_STORED_POSITIONS = 50;
const PERSIST_DEBOUNCE_MS = 500;
// A feed restored from cache needs several seconds to reconcile on a mid-range
// phone. A shorter budget expires mid-render, which is exactly when the page is
// still too short to hold the saved position.
const RESTORE_TIMEOUT_MS = 10000;
const SCROLL_TOLERANCE_PX = 2;

type ScrollPositions = Record<string, number>;

// Positions recorded during this page load. Persisting them is debounced, so
// this also serves the reads that happen before the next flush.
const pendingPositions: ScrollPositions = {};
let persistTimeout: number | null = null;

// Dropping the least recently written entries keeps the payload small.
const capPositions = (positions: ScrollPositions): ScrollPositions =>
  Object.fromEntries(Object.entries(positions).slice(-MAX_STORED_POSITIONS));

const getStorage = (): Storage | null => {
  try {
    return globalThis.window?.sessionStorage ?? null;
  } catch {
    // Reading storage throws outright when the browser blocks it.
    return null;
  }
};

// sessionStorage is per-tab and survives a reload, which is how a discarded
// mobile tab still comes back to the position the user left off at.
const readStoredPositions = (): ScrollPositions => {
  const storage = getStorage();

  if (!storage) {
    return {};
  }

  try {
    const stored: unknown = JSON.parse(
      storage.getItem(SESSION_STORAGE_KEY) ?? '{}',
    );

    return stored && typeof stored === 'object'
      ? (stored as ScrollPositions)
      : {};
  } catch {
    return {};
  }
};

const persistPositions = (): void => {
  if (persistTimeout) {
    window.clearTimeout(persistTimeout);
    persistTimeout = null;
  }

  const storage = getStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(
        capPositions({ ...readStoredPositions(), ...pendingPositions }),
      ),
    );
  } catch {
    // Hitting the quota must not break navigation, the in-memory map still works.
  }
};

// Writing on every scroll frame would stringify the whole map dozens of times a
// second, which is exactly the jank the phones in the report can't afford.
const schedulePersist = (): void => {
  if (persistTimeout) {
    return;
  }

  persistTimeout = window.setTimeout(() => {
    persistTimeout = null;
    persistPositions();
  }, PERSIST_DEBOUNCE_MS);
};

const getScrollKey = (asPath: string): string => {
  if (typeof window === 'undefined') {
    return asPath;
  }
  const historyKey = (window.history.state as { key?: string } | null)?.key;
  return historyKey ? `${asPath}:${historyKey}` : asPath;
};

const readPosition = (key: string): number => {
  const position = pendingPositions[key] ?? readStoredPositions()[key];

  return typeof position === 'number' ? position : 0;
};

const writePosition = (key: string, position: number): void => {
  // Re-inserting keeps insertion order aligned with recency so the cap drops
  // the entries the user is least likely to navigate back to.
  delete pendingPositions[key];
  pendingPositions[key] = position;

  Object.keys(pendingPositions)
    .slice(0, -MAX_STORED_POSITIONS)
    .forEach((staleKey) => delete pendingPositions[staleKey]);

  schedulePersist();
};

export const useScrollRestoration = (): void => {
  const { asPath } = useRouter();
  const isRestoringRef = useRef(false);

  useEffect(() => {
    let frame = 0;

    const handleScroll = () => {
      // Both our restore pass and Next's own reset-to-top on navigation emit
      // scroll events. Recording those would overwrite the user's position.
      if (isRestoringRef.current || frame) {
        return;
      }

      frame = requestAnimationFrame(() => {
        frame = 0;
        writePosition(getScrollKey(asPath), window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('pagehide', persistPositions);
    document.addEventListener('visibilitychange', persistPositions);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('pagehide', persistPositions);
      document.removeEventListener('visibilitychange', persistPositions);
      cancelAnimationFrame(frame);
      persistPositions();
    };
  }, [asPath]);

  useEffect(() => {
    const target = readPosition(getScrollKey(asPath));

    if (!target) {
      return undefined;
    }

    isRestoringRef.current = true;
    const deadline = performance.now() + RESTORE_TIMEOUT_MS;
    let frame = 0;

    const stop = () => {
      isRestoringRef.current = false;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      window.removeEventListener('keydown', stop);
      window.removeEventListener('mousedown', stop);
    };

    const tick = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      // Scrolling before the page is tall enough clamps to the bottom of what
      // has rendered so far, so wait instead of settling for a wrong position.
      if (maxScroll >= target) {
        window.scrollTo(0, target);

        // Next resets the scroll to the top in a layout effect of the same
        // commit that mounts us, so keep re-applying until the position sticks.
        if (Math.abs(window.scrollY - target) <= SCROLL_TOLERANCE_PX) {
          stop();
          return;
        }
      }

      if (performance.now() >= deadline) {
        stop();
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    // Restoring must never fight the user, any real input ends the attempt.
    // `mousedown` covers scrollbar drags, which emit no wheel event.
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    window.addEventListener('keydown', stop);
    window.addEventListener('mousedown', stop);

    frame = requestAnimationFrame(tick);

    return stop;
  }, [asPath]);
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
