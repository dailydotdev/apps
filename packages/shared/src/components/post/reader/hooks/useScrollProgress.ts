import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_HIDE_DELTA = 48;

/**
 * Hides a floating bar when the user scrolls down inside a scrollable container.
 * Cross-origin article iframes do not expose scroll position; in that case the bar stays visible.
 */
export function useScrollProgress(
  scrollContainerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
): { isFloatingBarHidden: boolean } {
  const [isFloatingBarHidden, setIsFloatingBarHidden] = useState(false);
  const lastScrollTopRef = useRef(0);

  const onScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) {
      return;
    }

    const top = el.scrollTop;
    const delta = top - lastScrollTopRef.current;
    lastScrollTopRef.current = top;

    if (top < 16) {
      setIsFloatingBarHidden(false);
      return;
    }

    if (delta > SCROLL_HIDE_DELTA) {
      setIsFloatingBarHidden(true);
      return;
    }

    if (delta < -SCROLL_HIDE_DELTA) {
      setIsFloatingBarHidden(false);
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    if (!enabled) {
      setIsFloatingBarHidden(false);
      return () => {};
    }

    const el = scrollContainerRef.current;
    if (!el) {
      return () => {};
    }

    lastScrollTopRef.current = el.scrollTop;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [enabled, onScroll, scrollContainerRef]);

  return { isFloatingBarHidden };
}
