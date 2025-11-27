import { useCallback, useEffect, useState } from 'react';
import { useToggle } from '../../hooks/useToggle';
import { useEventListener } from '../../hooks';

interface UseCalculateVisibleElements {
  calculateVisibleCards: () => void;
  isOverflowing: boolean;
  elementsCount: number;
  scrollableElementWidth: number;
}

export const useCalculateVisibleElements = <El extends HTMLElement>(
  element: El | null,
): UseCalculateVisibleElements => {
  const [isOverflowing, setIsOverflowing] = useToggle(false);
  const [elementsCount, setElementsCount] = useState<number>(0);
  const [scrollableElementWidth, setScrollableElementWidth] =
    useState<number>(0);

  const calculateVisibleCards = useCallback(() => {
    if (
      !element ||
      !element.firstElementChild ||
      !(element.firstElementChild instanceof HTMLElement)
    ) {
      return;
    }

    const firstChild = element.firstElementChild as HTMLElement;
    const elementStyle = getComputedStyle(firstChild);
    const containerStyle = getComputedStyle(element);

    const elementWidth = firstChild.offsetWidth;
    const elementMarginRight = parseFloat(elementStyle.marginRight || '0');
    const elementMarginLeft = parseFloat(elementStyle.marginLeft || '0');
    const containerGap = parseFloat(containerStyle.gap || '0');
    const elementWidthWithMarginsAndGap =
      elementWidth + elementMarginRight + elementMarginLeft + containerGap;

    const mainContainerWidth = element.offsetWidth;

    requestAnimationFrame(() => {
      const isOverflowingContent = element.scrollWidth > element.clientWidth;

      setIsOverflowing(isOverflowingContent);
      setScrollableElementWidth(elementWidthWithMarginsAndGap);
      setElementsCount(
        Math.floor(mainContainerWidth / elementWidthWithMarginsAndGap),
      );
    });
  }, [element, setIsOverflowing]);

  // Use ResizeObserver to detect any changes to the scrollable container or its children
  useEffect(() => {
    if (!element) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleCards();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [element, calculateVisibleCards]);

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
