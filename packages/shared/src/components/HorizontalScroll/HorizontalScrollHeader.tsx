import type { MouseEventHandler, ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../utilities/Link';
import { Button } from '../buttons/Button';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import ConditionalWrapper from '../ConditionalWrapper';
import { ArrowIcon } from '../icons';
import type { TypographyTag } from '../typography/Typography';
import { Typography, TypographyType } from '../typography/Typography';

export interface HorizontalScrollTitleProps {
  copy: string;
  id?: string;
  icon?: ReactNode;
  type?: TypographyType;
  tag?: TypographyTag;
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
  tag,
}: HorizontalScrollTitleProps): ReactElement => {
  return (
    <span className="flex flex-row items-center">
      {icon}
      <Typography tag={tag} type={type} id={id} bold>
        {copy}
      </Typography>
    </span>
  );
};

const isScrollTitleProps = (
  value: HorizontalScrollHeaderProps['title'],
): value is HorizontalScrollTitleProps =>
  !!value && typeof value === 'object' && 'copy' in value;

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
  const hasTitle = isScrollTitleProps(title) ? !!title.copy : !!title;

  // Rails that render their own heading above the scroll container pass no
  // title, so without scroll controls there is nothing left to show.
  if (!hasTitle && !canScroll) {
    return <></>;
  }

  return (
    <div
      className={classNames(
        'mx-4 flex min-h-10 w-auto flex-row items-center justify-between laptop:mx-0 laptop:w-full',
        !hasTitle && 'hidden tablet:flex',
        className,
      )}
    >
      {isScrollTitleProps(title) ? <HorizontalScrollTitle {...title} /> : title}
      {canScroll && (
        <div
          className={classNames(
            'flex-row items-center gap-3',
            hasTitle ? 'hidden tablet:flex' : 'flex',
          )}
        >
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
                <Link href={linkToSeeAll || ''} passHref legacyBehavior>
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
