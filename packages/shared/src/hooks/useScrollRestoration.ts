import { useEffect } from 'react';

import { useRouter } from 'next/router';

const scrollPositions: Record<string, number> = {};
const RESTORE_TIMEOUT_MS = 1000;

const getScrollKey = (asPath: string): string => {
  if (typeof window === 'undefined') {
    return asPath;
  }
  const historyKey = (window.history.state as { key?: string } | null)?.key;
  return historyKey ? `${asPath}:${historyKey}` : asPath;
};

export const useScrollRestoration = (): void => {
  const { asPath } = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions[getScrollKey(asPath)] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [asPath]);

  useEffect(() => {
    const target = scrollPositions[getScrollKey(asPath)] ?? 0;
    if (target === 0) {
      return undefined;
    }

    // Wait until the page is tall enough before scrolling, so we don't clamp
    // to the bottom while feed content is still hydrating.
    const deadline = performance.now() + RESTORE_TIMEOUT_MS;
    let frame = 0;

    const tick = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll >= target || performance.now() >= deadline) {
        window.scrollTo(0, Math.min(target, Math.max(0, maxScroll)));
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
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
