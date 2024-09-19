import { MutableRefObject, useCallback, useEffect, useState } from 'react';
import { useToggle } from '../../hooks/useToggle';
import { useEventListener } from '../../hooks';

interface UseCalculateVisibleElementsProps<El extends HTMLElement> {
  ref: MutableRefObject<El | null>;
}

interface UseCalculateVisibleElements {
  calculateVisibleCards: () => void;
  isOverflowing: boolean;
  elementsCount: number;
  scrollableElementWidth: number;
}

export const useCalculateVisibleElements = <El extends HTMLElement>({
  ref,
}: UseCalculateVisibleElementsProps<El>): UseCalculateVisibleElements => {
  const [isOverflowing, setIsOverflowing] = useToggle(false);
  const [elementsCount, setElementsCount] = useState<number>(0);
  const [scrollableElementWidth, setScrollableElementWidth] =
    useState<number>(0);

  const calculateVisibleCards = useCallback(() => {
    const currentRef = ref.current;
    if (
      !currentRef ||
      !currentRef.firstElementChild ||
      !(currentRef.firstElementChild instanceof HTMLElement)
    ) {
      return;
    }

    setTimeout(() => {
      setIsOverflowing(currentRef.scrollWidth > currentRef.clientWidth);
    }, 1000);

    if (currentRef && currentRef.firstElementChild) {
      const element = currentRef.firstElementChild;
      const elementWidth = element.offsetWidth;
      const elementMarginRight = parseFloat(
        getComputedStyle(element).marginRight || '0',
      );
      const elementMarginLeft = parseFloat(
        getComputedStyle(element).marginLeft || '0',
      );
      const containerGap = parseFloat(getComputedStyle(currentRef).gap || '0');
      const elementWidthWithMarginsAndGap =
        elementWidth + elementMarginRight + elementMarginLeft + containerGap;

      setScrollableElementWidth(elementWidthWithMarginsAndGap);

      const mainContainerWidth = currentRef.offsetWidth;
      setElementsCount(
        Math.floor(mainContainerWidth / elementWidthWithMarginsAndGap),
      );
    }
  }, [ref, setIsOverflowing]);

  // Recalculate number of cards on mount
  useEffect(() => {
    calculateVisibleCards();
  }, [calculateVisibleCards]);

  // Recalculate number of cards on window resize
  useEventListener(globalThis, 'resize', calculateVisibleCards);

  return {
    calculateVisibleCards,
    isOverflowing,
    elementsCount,
    scrollableElementWidth,
  };
};
