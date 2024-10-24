import React, { MouseEventHandler, ReactElement, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '../buttons/Button';
import { ButtonVariant } from '../buttons/common';
import ConditionalWrapper from '../ConditionalWrapper';
import { ArrowIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

export interface HorizontalScrollTitleProps {
  copy: string;
  id?: string;
  icon?: ReactNode;
  type?: TypographyType;
}

export interface HorizontalScrollHeaderProps {
  title: HorizontalScrollTitleProps;
  isAtEnd: boolean;
  isAtStart: boolean;
  onClickNext: MouseEventHandler;
  onClickPrevious: MouseEventHandler;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  canScroll: boolean;
}

export const HorizontalScrollTitle = ({
  id,
  copy,
  icon,
  type = TypographyType.Title2,
}: HorizontalScrollTitleProps): ReactElement => {
  return (
    <span className="flex flex-row items-center">
      {icon}
      <Typography type={type} id={id} bold>
        {copy}
      </Typography>
    </span>
  );
};

export function HorizontalScrollHeader({
  title,
  isAtEnd,
  isAtStart,
  onClickNext,
  onClickPrevious,
  onClickSeeAll,
  linkToSeeAll,
  canScroll,
}: HorizontalScrollHeaderProps): ReactElement {
  return (
    <div className="mx-4 mb-4 flex min-h-10 w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full">
      <HorizontalScrollTitle {...title} />
      {canScroll && (
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
                <Link href={linkToSeeAll} passHref legacyBehavior>
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
      )}
    </div>
  );
}
