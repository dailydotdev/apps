import { useEffect } from 'react';

interface UseScrollTopOffsetProps {
  onOverOffset: () => void;
  onUnderOffset: () => void;
  offset: number;
  scrollProperty?: 'scrollTop' | 'scrollY';
}

export const useScrollTopOffset = (
  getElement: () => HTMLElement | Window,
  {
    onOverOffset,
    onUnderOffset,
    offset,
    scrollProperty = 'scrollTop',
  }: UseScrollTopOffsetProps,
): void => {
  useEffect(() => {
    const element = getElement();

    if (!element) {
      return null;
    }

    const onScroll = (e) => {
      const command =
        e.currentTarget[scrollProperty] > offset ? onOverOffset : onUnderOffset;
      command();
    };

    element.addEventListener('scroll', onScroll);

    return () => {
      element.removeEventListener('scroll', onScroll);
    };
  }, [onOverOffset, onUnderOffset, offset, scrollProperty]);
};
