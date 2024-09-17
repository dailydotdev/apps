import React, { MouseEventHandler, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import ConditionalWrapper from '../ConditionalWrapper';
import { ArrowIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

export interface HorizontalScrollHeaderProps {
  title: ReactNode;
  titleId?: string;
  titleType?: TypographyType;
  isAtEnd: boolean;
  isAtStart: boolean;
  onClickNext: MouseEventHandler;
  onClickPrevious: MouseEventHandler;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
}

export function HorizontalScrollHeader({
  title,
  titleId,
  titleType = TypographyType.Title2,
  isAtEnd,
  isAtStart,
  onClickNext,
  onClickPrevious,
  onClickSeeAll,
  linkToSeeAll,
}: HorizontalScrollHeaderProps): ReactElement {
  return (
    <div className="mx-4 mb-4 flex w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full">
      <Typography
        className="flex flex-row items-center"
        type={titleType}
        id={titleId}
        bold
      >
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
}
