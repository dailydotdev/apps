import React, { RefObject, useCallback, useState } from 'react';
import useDebounceFn from '../../hooks/useDebounceFn';
import { useEventListener } from '../../hooks';

interface ScrollManagementReturn {
  isAtStart: boolean;
  isAtEnd: boolean;
}
export const useScrollManagement = (
  ref: React.RefObject<HTMLElement>,
  onScroll: (ref: RefObject<HTMLElement>) => void,
): ScrollManagementReturn => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (ref.current) {
      onScroll?.(ref);
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;

      setIsAtStart(scrollLeft === 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth);
    }
  }, [ref, onScroll]);

  const [debouncedOnScroll] = useDebounceFn(checkScrollPosition, 100);

  useEventListener(ref, 'scroll', debouncedOnScroll);

  return { isAtStart, isAtEnd };
};
