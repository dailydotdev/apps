import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

/**
 * The width a list card needs before its side-by-side layout reads well. Below
 * it the title column and the cover are fighting over a few hundred pixels, and
 * the card is better off stacked the way a phone stacks it.
 */
export const narrowContainerWidth = 500;

/**
 * Whether the element is narrower than the threshold.
 *
 * The cards inside the agent's content panel decide their layout off the
 * *panel*, which the reader drags, not off the window — and a media query can
 * only ever answer for the window. Measured here and passed down as a prop, so
 * the layout decision stays with the card instead of living in a stylesheet
 * that overrides the card's utility classes by name.
 */
export const useNarrowContainer = <T extends HTMLElement>(
  threshold = narrowContainerWidth,
): { ref: RefObject<T>; isNarrow: boolean } => {
  const ref = useRef<T>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width } = entry.contentRect;

      // Zero is what an element measures before layout and again while hidden.
      // Taking it literally would stack every card the moment the panel closed.
      if (!width) {
        return;
      }

      setIsNarrow(width < threshold);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isNarrow };
};
