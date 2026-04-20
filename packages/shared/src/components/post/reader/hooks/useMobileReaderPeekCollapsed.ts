import type { RefObject } from 'react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReaderArticleMode } from '../ArticleReaderFrame';

const SCROLL_HIDE_DELTA = 48;

function findScrollableAncestor(start: HTMLElement | null): HTMLElement | null {
  let el: HTMLElement | null = start?.parentElement ?? null;
  while (el) {
    const st = globalThis.getComputedStyle(el);
    if (
      st.overflowY === 'auto' ||
      st.overflowY === 'scroll' ||
      st.overflowY === 'overlay'
    ) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

/**
 * When the user scrolls the article column (fallback) or the nearest scrollable
 * page ancestor (e.g. modal overlay on mobile), collapse the peek strip to
 * actions-only. Cross-origin iframes do not expose scroll; those paths stay expanded.
 */
export function useMobileReaderPeekCollapsed(
  fallbackScrollRef: RefObject<HTMLDivElement | null>,
  articleMode: ReaderArticleMode,
  layoutRootRef: RefObject<HTMLDivElement | null>,
): { isPeekCollapsed: boolean } {
  const [isPeekCollapsed, setIsPeekCollapsed] = useState(false);
  const lastScrollTopRef = useRef(0);
  const [embedScrollParent, setEmbedScrollParent] =
    useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const start = layoutRootRef.current;
    if (!start) {
      setEmbedScrollParent(null);
      return;
    }
    setEmbedScrollParent(findScrollableAncestor(start));
  }, [layoutRootRef]);

  const onScroll = useCallback(() => {
    const el =
      articleMode === 'fallback'
        ? fallbackScrollRef.current
        : embedScrollParent;
    if (!el) {
      return;
    }

    const top = el.scrollTop;
    const delta = top - lastScrollTopRef.current;
    lastScrollTopRef.current = top;

    if (top < 16) {
      setIsPeekCollapsed(false);
      return;
    }

    if (delta > SCROLL_HIDE_DELTA) {
      setIsPeekCollapsed(true);
      return;
    }

    if (delta < -SCROLL_HIDE_DELTA) {
      setIsPeekCollapsed(false);
    }
  }, [articleMode, embedScrollParent, fallbackScrollRef]);

  useEffect(() => {
    const el =
      articleMode === 'fallback'
        ? fallbackScrollRef.current
        : embedScrollParent;
    if (!el) {
      return () => {};
    }
    lastScrollTopRef.current = el.scrollTop;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
    };
  }, [articleMode, embedScrollParent, fallbackScrollRef, onScroll]);

  return { isPeekCollapsed };
}
