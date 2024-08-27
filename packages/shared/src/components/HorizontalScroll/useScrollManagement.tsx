import React, { useCallback, useEffect, useState } from 'react';
import useDebounceFn from '../../hooks/useDebounceFn';

export const useScrollManagement = (ref: React.RefObject<HTMLDivElement>) => {
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const checkScrollPosition = useCallback(() => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;

      setIsAtStart(scrollLeft === 0);
      setIsAtEnd(scrollLeft + clientWidth >= scrollWidth);
    }
  }, []);

  // Debounced scroll handler using your custom hook
  const [debouncedOnScroll] = useDebounceFn(checkScrollPosition, 100);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.addEventListener('scroll', debouncedOnScroll);
    return () => {
      element.removeEventListener('scroll', debouncedOnScroll);
    };
  }, [debouncedOnScroll]);

  return { isAtStart, isAtEnd };
};
