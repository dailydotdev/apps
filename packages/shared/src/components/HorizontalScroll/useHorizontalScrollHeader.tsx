import React, {
  FunctionComponent,
  MouseEventHandler,
  ReactNode,
  RefObject,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Link from 'next/link';
import { useScrollManagement } from './useScrollManagement';
import { Button, ButtonVariant } from '../buttons/Button';
import { ArrowIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';
import ConditionalWrapper from '../ConditionalWrapper';
import { useCalculateVisibleElements } from './useCalculateVisibleElements';

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

export interface HorizontalScrollHeaderProps {
  onScroll?: (ref: RefObject<HTMLElement>) => void;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  title: string | ReactNode;
}

export const useHorizontalScrollHeader = <
  El extends HTMLElement = HTMLDivElement,
>({
  onScroll,
  onClickSeeAll,
  linkToSeeAll,
  title,
}: HorizontalScrollHeaderProps): HorizontalScrollHeaderReturn<El> => {
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
      ({ titleId }: { titleId: string }) => {
        return (
          <div className="mx-4 mb-4 flex w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full">
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
      },
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
