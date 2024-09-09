import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import Link from 'next/link';
import { useScrollManagement } from './useScrollManagement';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { useEventListener } from '../../hooks';
import { Typography, TypographyType } from '../typography/Typography';
import ConditionalWrapper from '../ConditionalWrapper';

interface HorizontalScrollHeaderReturn {
  Header: FunctionComponent<{ titleId?: string }>;
  ref: React.RefObject<HTMLDivElement>;
}

export interface HorizontalScrollHeaderProps {
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  title: string | ReactNode;
}

export const useHorizontalScrollHeader = ({
  onScroll,
  onClickSeeAll,
  linkToSeeAll,
  title,
}: HorizontalScrollHeaderProps): HorizontalScrollHeaderReturn => {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollableElementWidth, setScrollableElementWidth] =
    useState<number>(0);
  const [numCards, setNumCards] = useState<number>(0);

  // Calculate the width of elements and the number of visible cards
  const calculateVisibleCards = useCallback(() => {
    const currentRef = ref.current;
    if (
      !currentRef ||
      !currentRef.firstElementChild ||
      !(currentRef.firstElementChild instanceof HTMLElement)
    ) {
      return;
    }

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
      setNumCards(
        Math.floor(mainContainerWidth / elementWidthWithMarginsAndGap),
      );
    }
  }, []);

  // Recalculate number of cards on mount
  useEffect(() => {
    calculateVisibleCards();
  }, [calculateVisibleCards]);

  // Recalculate number of cards on window resize
  useEventListener(globalThis, 'resize', calculateVisibleCards);

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

  const Header = ({ titleId }: { titleId: string }) => {
    return (
      <div className="mx-4 mb-4 flex w-auto items-center justify-between laptop:mx-0 laptop:w-full">
        <Typography type={TypographyType.Title2} id={titleId} bold>
          {title}
        </Typography>
        <div className="hidden flex-row items-center gap-3 tablet:flex">
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
          {(onClickSeeAll || linkToSeeAll) && (
            <ConditionalWrapper
              condition={!!linkToSeeAll}
              wrapper={(component) => (
                <Link href={linkToSeeAll} passHref>
                  {component}
                </Link>
              )}
            >
              <Button
                variant={ButtonVariant.Tertiary}
                onClick={onClickSeeAll}
                aria-label="See all"
                tag={linkToSeeAll ? 'a' : 'button'}
              >
                See all
              </Button>
            </ConditionalWrapper>
          )}
        </div>
      </div>
    );
  };

  return { Header, ref };
};
