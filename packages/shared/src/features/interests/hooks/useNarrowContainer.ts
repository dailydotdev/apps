import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

// List cards need roughly this much room before their metadata row starts
// wrapping; below it the grid card reads better.
export const narrowContainerWidth = 550;

export const useNarrowContainer = <T extends HTMLElement>(
  threshold = narrowContainerWidth,
): { ref: RefObject<T>; isNarrow: boolean } => {
  const ref = useRef<T>(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const observer = new ResizeObserver(([entry]) =>
      setIsNarrow(entry.contentRect.width < threshold),
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isNarrow };
};
