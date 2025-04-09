'use client';

import { useEffect, useRef } from 'react';

interface UseWindowScrollProps {
  onScroll?: (scrollY: number) => void;
}

export const useWindowScroll = (options?: UseWindowScrollProps): void => {
  const { onScroll } = options || {};
  const onScrollRef = useRef(onScroll);

  useEffect(() => {
    onScrollRef.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    const handleScroll = () => {
      onScrollRef.current?.(window.scrollY);
    };

    globalThis?.addEventListener?.('scroll', handleScroll, { passive: true });
    return () => {
      globalThis?.removeEventListener?.('scroll', handleScroll);
    };
  }, []);
};
