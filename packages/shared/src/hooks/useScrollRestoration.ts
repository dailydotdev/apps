import { useEffect, useRef } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};

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
    let frame = 0;
    let stopped = false;
    let observer: ResizeObserver;
    const controller = new AbortController();

    const stop = () => {
      stopped = true;
      isRestoringRef.current = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controller.abort();
    };

    const restore = () => {
      if (stopped) {
        return;
      }

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      // Scrolling before the page is tall enough clamps to the bottom of what
      // has rendered so far, so wait rather than settle for a wrong position.
      if (maxScroll >= target) {
        window.scrollTo(0, target);
        stop();
      }
    };

    observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(restore);
    });

    // Restoring must never fight the user, any real input ends the attempt.
    // `mousedown` covers scrollbar drags, which emit no wheel event.
    const { signal } = controller;
    window.addEventListener('wheel', stop, { passive: true, signal });
    window.addEventListener('touchmove', stop, { passive: true, signal });
    window.addEventListener('keydown', stop, { signal });
    window.addEventListener('mousedown', stop, { signal });

    observer.observe(document.body);
    observer.observe(document.documentElement);
    window.addEventListener('resize', restore, { signal });
    frame = requestAnimationFrame(restore);

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
