import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useScrollManagement } from './useScrollManagement';
import { useCalculateVisibleElements } from './useCalculateVisibleElements';
import {
  HorizontalScrollHeader,
  HorizontalScrollHeaderProps,
} from './HorizontalScrollHeader';

interface HorizontalScrollHeaderReturn<
  El extends HTMLElement = HTMLDivElement,
> {
  Header: FunctionComponent<{ titleId?: string }>;
  isAtEnd: boolean;
  isAtStart: boolean;
  isOverflowing: boolean;
  onClickNext: MouseEventHandler;
  onClickPrevious: MouseEventHandler;
  ref: React.RefObject<El>;
}

type HeaderProps = Pick<HorizontalScrollHeaderProps, 'titleId' | 'titleType'>;

export interface UseHorizontalScrollHeaderProps {
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  title: ReactNode;
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

  const Header = useMemo(
    () =>
      // eslint-disable-next-line react/display-name
      (props: HeaderProps = {}) =>
        (
          <HorizontalScrollHeader
            {...props}
            title={title}
            isAtEnd={isAtEnd}
            isAtStart={isAtStart}
            onClickNext={onClickNext}
            onClickPrevious={onClickPrevious}
            onClickSeeAll={onClickSeeAll}
            linkToSeeAll={linkToSeeAll}
          />
        ),
    [
      isAtEnd,
      isAtStart,
      linkToSeeAll,
      onClickNext,
      onClickPrevious,
      onClickSeeAll,
      title,
    ],
  );

  return {
    Header,
    ref,
    isAtStart,
    isAtEnd,
    onClickNext,
    onClickPrevious,
    isOverflowing,
  };
};
