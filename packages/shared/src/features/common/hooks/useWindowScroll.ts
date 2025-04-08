'use client';

import { useEffect, useState } from 'react';

interface UseWindowScrollProps {
  onScroll?: () => void;
}

interface UseWindowScrollReturn {
  y: number;
}

export const useWindowScroll = (
  options?: UseWindowScrollProps,
): UseWindowScrollReturn => {
  const { onScroll } = options || {};
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    setScrollPosition(window.scrollY);
    onScroll?.();
  };

  useEffect(
    () => {
      globalThis?.addEventListener?.('scroll', handleScroll, { passive: true });
      return () => {
        globalThis?.removeEventListener?.('scroll', handleScroll);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    y: scrollPosition,
  };
};
