import { useCallback, useEffect, useRef, useState } from 'react';
import useDebounceFn from '../../hooks/useDebounceFn';

interface ScrollManagementReturn {
  isAtStart: boolean;
  isAtEnd: boolean;
}
export const useScrollManagement = (
  element: HTMLElement | null,
  onScroll?: (element: HTMLElement) => void,
): ScrollManagementReturn => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (element) {
      onScroll?.(element);
      const { scrollLeft, scrollWidth, clientWidth } = element;

      setIsAtStart(scrollLeft === 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
    }
  }, [element, onScroll]);

  useEffect(() => {
    if (!element) {
      return undefined;
    }
    // For cases where the scroll container becomes smaller, such as sidebar resize,
    // and all the buttons are not visible anymore.
    // also needs to run checkScrollPosition once at start to determine which arrows to show.
    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition();
    });
    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollPosition, element]);

  const [debouncedOnScroll] = useDebounceFn(checkScrollPosition, 100);

  // Store the handler in a ref so we can add/remove the same reference
  const handlerRef = useRef(debouncedOnScroll);
  handlerRef.current = debouncedOnScroll;

  useEffect(() => {
    if (!element) {
      return undefined;
    }
    const handler = (e: Event) => handlerRef.current(e);
    element.addEventListener('scroll', handler);
    return () => {
      element.removeEventListener('scroll', handler);
    };
  }, [element]);

  return { isAtStart, isAtEnd };
};
