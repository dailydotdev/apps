import type { MouseEventHandler, ReactNode, RefObject } from 'react';
import React, { useCallback, useRef } from 'react';
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
  ref: React.RefObject<El>;
}

export interface UseHorizontalScrollHeaderProps {
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  title: HorizontalScrollTitleProps;
}

export const useHorizontalScrollHeader = <
  El extends HTMLElement = HTMLDivElement,
>({
  onScroll,
  onClickSeeAll,
  linkToSeeAll,
  title,
}: UseHorizontalScrollHeaderProps): HorizontalScrollHeaderReturn<El> => {
  const ref = useRef<El>(null);
  // Calculate the width of elements and the number of visible cards
  const {
    scrollableElementWidth,
    isOverflowing,
    elementsCount: numCards,
  } = useCalculateVisibleElements({ ref });

  const { isAtStart, isAtEnd } = useScrollManagement(ref, onScroll);

  const onClickNext = useCallback(() => {
    if (ref.current) {
      onScroll?.(ref);
      ref.current.scrollLeft += numCards * scrollableElementWidth;
    }
  }, [numCards, scrollableElementWidth, onScroll]);

  const onClickPrevious = useCallback(() => {
    if (ref.current) {
      onScroll?.(ref);

      ref.current.scrollLeft = Math.max(
        0,
        ref.current.scrollLeft - numCards * scrollableElementWidth,
      );
    }
  }, [numCards, scrollableElementWidth, onScroll]);

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
    />
  );

  return {
    header,
    ref,
    isAtStart,
    isAtEnd,
    onClickNext,
    onClickPrevious,
    isOverflowing,
  };
};
