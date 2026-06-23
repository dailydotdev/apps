import type { RefObject } from 'react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Layout effects must run before paint to avoid a flash of the wrong size, but
// `useLayoutEffect` warns during SSR — fall back to `useEffect` on the server.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface UseFitFontSizeProps {
  /** Re-measures whenever this changes (pass the rendered text). */
  text: string;
  /** Font-size utility classes, largest first (e.g. typo-title1 → title3). */
  sizeClasses: string[];
  /** Maximum number of lines the text may occupy at the chosen size. */
  maxLines: number;
}

interface UseFitFontSizeResult<T> {
  ref: RefObject<T>;
  /** The largest size class at which the text fits within `maxLines`. */
  sizeClass: string;
  /**
   * True once the smallest size is reached and the text still overflows — the
   * caller should clamp (ellipsis) as a last resort. While stepping down we
   * leave the text unclamped so `scrollHeight` reflects its true height.
   */
  isClamped: boolean;
}

/**
 * Shrinks text to the largest font size at which it still fits within
 * `maxLines`, measuring the rendered element rather than guessing from
 * character count (the container width varies, so a count heuristic can't be
 * trusted). Steps down one size per layout pass until it fits or bottoms out.
 */
export function useFitFontSize<T extends HTMLElement>({
  text,
  sizeClasses,
  maxLines,
}: UseFitFontSizeProps): UseFitFontSizeResult<T> {
  const ref = useRef<T>(null);
  const [index, setIndex] = useState(0);
  const lastIndex = sizeClasses.length - 1;

  // Start fresh from the largest size whenever the text changes.
  useIsomorphicLayoutEffect(() => {
    setIndex(0);
  }, [text]);

  // After each applied size, measure and step down once if it still overflows.
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || index >= lastIndex) {
      return;
    }
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (!lineHeight) {
      return;
    }
    if (Math.round(el.scrollHeight / lineHeight) > maxLines) {
      setIndex((current) => Math.min(current + 1, lastIndex));
    }
  }, [text, index, maxLines, lastIndex]);

  // Re-fit from scratch when the available width changes (height changes from
  // our own shrinking are ignored so we don't loop).
  useIsomorphicLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    let lastWidth = parent.clientWidth;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? lastWidth;
      if (Math.abs(width - lastWidth) > 1) {
        lastWidth = width;
        setIndex(0);
      }
    });
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  return { ref, sizeClass: sizeClasses[index], isClamped: index >= lastIndex };
}
