import React, { RefObject, useCallback, useEffect, useState } from 'react';
import useDebounceFn from '../../hooks/useDebounceFn';

export const useScrollManagement = (
  ref: React.RefObject<HTMLElement>,
  onScroll: (ref: RefObject<HTMLElement>) => void,
) => {
  const [isAtStart, setIsAtStart] = useState(false);
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

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    element.addEventListener('scroll', debouncedOnScroll);
    return () => {
      element.removeEventListener('scroll', debouncedOnScroll);
    };
  }, [ref, debouncedOnScroll]);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (!isAtEnd && !isAtStart) {
      checkScrollPosition();
    }
  }, [ref, isAtStart, isAtEnd, checkScrollPosition]);

  return { isAtStart, isAtEnd };
};
