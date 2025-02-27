import type { RefObject } from 'react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useEventListener } from '../../hooks';

interface ScrollManagementReturn {
  isAtStart: boolean;
  isAtEnd: boolean;
}
export const useScrollManagement = (
  ref: React.RefObject<HTMLElement>,
  onScroll?: (ref: RefObject<HTMLElement>) => void,
): ScrollManagementReturn => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (ref.current) {
      onScroll?.(ref);
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;

      setIsAtStart(scrollLeft === 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  }, [ref, onScroll]);

  useEffect(() => {
    // For cases where the scroll container becomes smaller, such as sidebar resize,
    // and all the buttons are not visible anymore.
    // also needs to run checkScrollPosition once at start to determine which arrows to show.
    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });
    if (ref.current && globalThis) {
      resizeObserver.observe(ref.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, ref]);

  const [debouncedOnScroll] = useDebounceFn(checkScrollPosition, 100);

  useEventListener(ref, 'scroll', debouncedOnScroll);

  return { isAtStart, isAtEnd };
};
