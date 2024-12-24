import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';
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

    const element = currentRef.firstElementChild as HTMLElement;
    const elementStyle = getComputedStyle(element);
    const containerStyle = getComputedStyle(currentRef);

    const elementWidth = element.offsetWidth;
    const elementMarginRight = parseFloat(elementStyle.marginRight || '0');
    const elementMarginLeft = parseFloat(elementStyle.marginLeft || '0');
    const containerGap = parseFloat(containerStyle.gap || '0');
    const elementWidthWithMarginsAndGap =
      elementWidth + elementMarginRight + elementMarginLeft + containerGap;

    const mainContainerWidth = currentRef.offsetWidth;

    requestAnimationFrame(() => {
      const isOverflowingContent =
        currentRef.scrollWidth > currentRef.clientWidth;

      setIsOverflowing(isOverflowingContent);
      setScrollableElementWidth(elementWidthWithMarginsAndGap);
      setElementsCount(
        Math.floor(mainContainerWidth / elementWidthWithMarginsAndGap),
      );
    });
  }, [ref, setIsOverflowing]);

  // Use ResizeObserver to detect any changes to the scrollable container or its children
  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleCards();
    });

    resizeObserver.observe(currentRef);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, calculateVisibleCards]);

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
