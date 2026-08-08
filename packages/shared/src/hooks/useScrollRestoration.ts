import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};
// A feed restored from cache needs longer than a second to reconcile on a
// mid-range phone. A shorter budget expires mid-render, which is exactly when
// the page is still too short to hold the saved position.
const RESTORE_TIMEOUT_MS = 2000;

const getScrollKey = (asPath: string): string => {
  if (typeof window === 'undefined') {
    return asPath;
  }
  const historyKey = (window.history.state as { key?: string } | null)?.key;
  return historyKey ? `${asPath}:${historyKey}` : asPath;
};

export const useScrollRestoration = (): void => {
  const { asPath } = useRouter();
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      // Our own restore pass and Next's reset-to-top on navigation both emit
      // scroll events, and neither is where the user actually was.
      if (isRestoringRef.current) {
        return;
      }

      scrollPositions[getScrollKey(asPath)] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [asPath]);

  useEffect(() => {
    const target = scrollPositions[getScrollKey(asPath)] ?? 0;

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
      // has rendered so far, so wait rather than settle for a wrong position.
      if (maxScroll >= target) {
        window.scrollTo(0, target);
        stop();
        return;
      }

      // Out of budget: the feed never got there, so leave the user at the top.
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
