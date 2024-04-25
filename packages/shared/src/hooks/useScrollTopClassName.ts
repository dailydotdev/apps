import { useState } from 'react';
import { useScrollTopOffset } from './useScrollTopOffset';

interface UseScrollTopStyleProps {
  scrolledClassName: string;
  defaultClassName?: string;
  scrollProperty?: 'scrollTop' | 'scrollY';
  offset?: number;
}

export const useScrollTopClassName = ({
  scrolledClassName,
  defaultClassName,
  scrollProperty = 'scrollY',
  offset = 0,
}: UseScrollTopStyleProps): string => {
  const [isScrolled, setScrolled] = useState(true);

  useScrollTopOffset(() => globalThis?.window, {
    onOverOffset: () => setScrolled(false),
    onUnderOffset: () => setScrolled(true),
    offset,
    scrollProperty,
  });

  return isScrolled ? scrolledClassName : defaultClassName;
};
