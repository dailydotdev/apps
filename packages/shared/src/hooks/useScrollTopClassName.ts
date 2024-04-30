import { useState } from 'react';
import { useScrollTopOffset } from './useScrollTopOffset';

interface UseScrollTopStyleProps {
  scrolledClassName?: string;
  defaultClassName?: string;
  scrollProperty?: 'scrollTop' | 'scrollY';
  offset?: number;
  enabled?: boolean;
  fallbackClassName?: string;
}

export const useScrollTopClassName = ({
  scrolledClassName = 'bg-background-default',
  defaultClassName = 'bg-transparent',
  scrollProperty = 'scrollY',
  offset = 0,
  enabled = true,
  fallbackClassName = 'bg-background-default',
}: UseScrollTopStyleProps = {}): string => {
  const [isScrolled, setScrolled] = useState(false);

  useScrollTopOffset(() => globalThis?.window, {
    onOverOffset: () => setScrolled(true),
    onUnderOffset: () => setScrolled(false),
    offset,
    scrollProperty,
  });

  if (!enabled) {
    return fallbackClassName;
  }

  return isScrolled ? scrolledClassName : defaultClassName;
};
