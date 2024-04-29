import { useState } from 'react';
import { useScrollTopOffset } from './useScrollTopOffset';

interface UseScrollTopStyleProps {
  scrolledClassName?: string;
  defaultClassName?: string;
  scrollProperty?: 'scrollTop' | 'scrollY';
  offset?: number;
}

export const useScrollTopClassName = ({
  scrolledClassName = 'bg-background-default',
  defaultClassName = 'bg-transparent',
  scrollProperty = 'scrollY',
  offset = 0,
}: UseScrollTopStyleProps = {}): string => {
  const [isScrolled, setScrolled] = useState(true);

  useScrollTopOffset(() => globalThis?.window, {
    onOverOffset: () => setScrolled(true),
    onUnderOffset: () => setScrolled(false),
    offset,
    scrollProperty,
  });

  return isScrolled ? scrolledClassName : defaultClassName;
};
