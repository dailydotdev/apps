import React, {
  MouseEventHandler,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useScrollManagement } from './useScrollManagement';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';

interface HorizontalScrollHeaderReturn {
  Header: React.ComponentType<React.HTMLAttributes<HTMLDivElement>>;
  ref: React.RefObject<HTMLDivElement>;
}

export interface HorizontalScrollHeaderProps {
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  title: string | ReactElement;
}

export const useHorizontalScrollHeader = ({
  onScroll,
  onClickSeeAll,
  title,
}: HorizontalScrollHeaderProps): HorizontalScrollHeaderReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollableElementWidth, setScrollableElementWidth] =
    useState<number>(0);
  const [numCards, setNumCards] = useState<number>(0);

  // Calculate the width of elements and the number of visible cards
  const calculateVisibleCards = useCallback(() => {
    if (ref.current && ref.current.firstElementChild) {
      const element = ref.current.firstElementChild as HTMLElement;
      const elementWidth = element.offsetWidth;
      const elementMarginRight = parseFloat(
        getComputedStyle(element).marginRight || '0',
      );
      const elementMarginLeft = parseFloat(
        getComputedStyle(element).marginLeft || '0',
      );
      const containerGap = parseFloat(getComputedStyle(ref.current).gap || '0');
      const elementWidthWithMarginsAndGap =
        elementWidth + elementMarginRight + elementMarginLeft + containerGap;

      setScrollableElementWidth(elementWidthWithMarginsAndGap);

      const mainContainerWidth = ref.current.offsetWidth;
      setNumCards(
        Math.floor(mainContainerWidth / elementWidthWithMarginsAndGap),
      );
    }
  }, []);

  // Recalculate number of cards on mount and window resize
  useEffect(() => {
    calculateVisibleCards();

    const handleResize = () => {
      calculateVisibleCards();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateVisibleCards]);

  const { isAtStart, isAtEnd } = useScrollManagement(ref, onScroll);

  const onClickNext = () => {
    if (ref.current) {
      onScroll?.(ref);
      ref.current.scrollLeft += numCards * scrollableElementWidth;
    }
  };

  const onClickPrevious = () => {
    if (ref.current) {
      onScroll?.(ref);

      ref.current.scrollLeft = Math.max(
        0,
        ref.current.scrollLeft - numCards * scrollableElementWidth,
      );
    }
  };

  const Header = () => {
    return (
      <div className="mx-4 mb-4 flex w-auto items-center justify-between laptop:mx-0 laptop:w-full">
        <p className="flex items-center font-bold typo-body">{title}</p>
        <div className="hidden flex-row gap-3 tablet:flex">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            disabled={isAtStart}
            onClick={onClickPrevious}
            aria-label="Scroll left"
          />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="rotate-90" />}
            disabled={isAtEnd}
            onClick={onClickNext}
            aria-label="Scroll right"
          />
          {onClickSeeAll && (
            <Button
              variant={ButtonVariant.Tertiary}
              onClick={onClickSeeAll}
              aria-label="See all"
            >
              See all
            </Button>
          )}
        </div>
      </div>
    );
  };

  return { Header, ref };
};
