import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

// Below this a list card's title column and cover fight over too little width,
// so it stacks instead.
export const narrowContainerWidth = 500;

// The panel the cards sit in is drag-resized, and a media query can only answer
// for the window, so the width is measured and passed down as a prop.
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

      // ResizeObserver reports 0 before layout and while hidden; taking it
      // literally would stack every card the moment the panel closed.
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
