import type {
  Dispatch,
  MouseEventHandler,
  ReactNode,
  SetStateAction,
} from 'react';
import React, { useCallback, useState } from 'react';
import { ButtonSize } from '../buttons/common';
import { useScrollManagement } from './useScrollManagement';
import { useCalculateVisibleElements } from './useCalculateVisibleElements';
import type { HorizontalScrollTitleProps } from './HorizontalScrollHeader';
import { HorizontalScrollHeader } from './HorizontalScrollHeader';

interface HorizontalScrollHeaderReturn<
  El extends HTMLElement = HTMLDivElement,
> {
  header: ReactNode;
  isAtEnd: boolean;
  isAtStart: boolean;
  isOverflowing: boolean;
  onClickNext: MouseEventHandler;
  onClickPrevious: MouseEventHandler;
  ref: Dispatch<SetStateAction<El | null>>;
}

export interface UseHorizontalScrollHeaderProps {
  onScroll?: (element: HTMLElement) => void;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  title?: HorizontalScrollTitleProps | ReactNode;
  className?: string;
  buttonSize?: ButtonSize;
}

export const useHorizontalScrollHeader = <
  El extends HTMLElement = HTMLDivElement,
>({
  onScroll,
  onClickSeeAll,
  linkToSeeAll,
  title,
  className,
  buttonSize = ButtonSize.Medium,
}: UseHorizontalScrollHeaderProps): HorizontalScrollHeaderReturn<El> => {
  const [element, setElement] = useState<El | null>(null);
  // Calculate the width of elements and the number of visible cards
  const {
    scrollableElementWidth,
    isOverflowing,
    elementsCount: numCards,
  } = useCalculateVisibleElements(element);

  const { isAtStart, isAtEnd } = useScrollManagement(element, onScroll);

  const onClickNext = useCallback(() => {
    if (element) {
      onScroll?.(element);
      element.scrollLeft += numCards * scrollableElementWidth;
    }
  }, [element, numCards, scrollableElementWidth, onScroll]);

  const onClickPrevious = useCallback(() => {
    if (element) {
      onScroll?.(element);

      element.scrollLeft = Math.max(
        0,
        element.scrollLeft - numCards * scrollableElementWidth,
      );
    }
  }, [element, numCards, scrollableElementWidth, onScroll]);

  const header = (
    <HorizontalScrollHeader
      title={title}
      isAtEnd={isAtEnd}
      isAtStart={isAtStart}
      canScroll={isOverflowing}
      onClickNext={onClickNext}
      onClickPrevious={onClickPrevious}
      onClickSeeAll={onClickSeeAll}
      linkToSeeAll={linkToSeeAll}
      className={className}
      buttonSize={buttonSize}
    />
  );

  return {
    header,
    ref: setElement,
    isAtStart,
    isAtEnd,
    onClickNext,
    onClickPrevious,
    isOverflowing,
  };
};
