import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
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
  title?: HorizontalScrollTitleProps | ReactNode;
  isAtEnd: boolean;
  isAtStart: boolean;
  onClickNext: MouseEventHandler;
  onClickPrevious: MouseEventHandler;
  onClickSeeAll?: MouseEventHandler;
  linkToSeeAll?: string;
  canScroll: boolean;
  className?: string;
  buttonSize?: ButtonSize;
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
  className,
  buttonSize = ButtonSize.Medium,
}: HorizontalScrollHeaderProps): ReactElement {
  // Check if title is props object or custom ReactNode
  const isCustomTitle =
    title && typeof title === 'object' && !('copy' in title);

  return (
    <div
      className={classNames(
        'mx-4 mb-4 flex min-h-10 w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full',
        className,
      )}
    >
      {isCustomTitle
        ? title
        : title && (
            <HorizontalScrollTitle {...(title as HorizontalScrollTitleProps)} />
          )}
      {canScroll && (
        <div className="hidden flex-row items-center gap-3 tablet:flex">
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="-rotate-90" />}
            disabled={isAtStart}
            onClick={onClickPrevious}
            aria-label="Scroll left"
            size={buttonSize}
          />
          <Button
            variant={ButtonVariant.Tertiary}
            icon={<ArrowIcon className="rotate-90" />}
            disabled={isAtEnd}
            onClick={onClickNext}
            aria-label="Scroll right"
            size={buttonSize}
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
