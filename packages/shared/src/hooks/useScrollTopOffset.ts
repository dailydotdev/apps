import { useEffect } from 'react';

interface UseScrollTopOffsetProps {
  onOverOffset: () => void;
  onUnderOffset: () => void;
  offset?: number;
  scrollProperty?: 'scrollTop' | 'scrollY';
}

export const useScrollTopOffset = (
  getElement: () => HTMLElement | Window,
  {
    onOverOffset,
    onUnderOffset,
    offset = 0,
    scrollProperty = 'scrollTop',
  }: UseScrollTopOffsetProps,
): void => {
  useEffect(() => {
    const element = getElement();

    if (!element) {
      return undefined;
    }

    const onScroll = () => {
      let scrollValue = document.documentElement.scrollTop;

      if (scrollProperty === 'scrollY') {
        scrollValue = 'scrollY' in element ? element.scrollY : window.scrollY;
      } else if ('scrollTop' in element) {
        scrollValue = element.scrollTop;
      }

      const command = scrollValue > offset ? onOverOffset : onUnderOffset;
      command();
    };

    element.addEventListener('scroll', onScroll);

    return () => {
      element.removeEventListener('scroll', onScroll);
    };
  }, [onOverOffset, onUnderOffset, offset, scrollProperty, getElement]);
};
