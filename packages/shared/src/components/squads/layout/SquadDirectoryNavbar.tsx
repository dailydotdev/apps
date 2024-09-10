import React, { ComponentProps, ReactElement } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { useHorizontalScrollHeader } from '../../HorizontalScroll/useHorizontalScrollHeader';
import { ArrowIcon } from '../../icons';
import { useViewSize, ViewSize } from '../../../hooks';

interface SquadNavbarItemProps extends Omit<ComponentProps<'li'>, 'onClick'> {
  buttonSize: ButtonSize;
  isActive: boolean;
  label: string;
  onClick: ButtonProps<'a'>['onClick'];
  path?: string;
}

export const SquadDirectoryNavbarItem = ({
  buttonSize,
  className,
  isActive,
  label,
  onClick,
  path,
  ...attrs
}: SquadNavbarItemProps): ReactElement => (
  <li
    {...attrs}
    className={classNames(
      'relative py-3',
      'after:absolute after:bottom-0 after:left-0 after:right-0 after:mx-auto after:w-14 after:border-b-2',
      {
        'after:hidden': !isActive,
      },
      className,
    )}
  >
    <Button
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Navigate to ${label}'s directory page`}
      className="capitalize"
      href={path}
      onClick={onClick}
      size={buttonSize}
      tag={path ? 'a' : 'button'}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Tertiary}
    >
      {label}
    </Button>
  </li>
);

export const SquadDirectoryNavbar = (
  props: ComponentProps<'nav'>,
): ReactElement => {
  const { className, children, ...attrs } = props;
  const {
    ref,
    onClickPrevious,
    onClickNext,
    isAtEnd,
    isAtStart,
    isOverflowing,
  } = useHorizontalScrollHeader<HTMLUListElement>({
    title: 'Squad directory navigation',
  });
  const isLaptop = useViewSize(ViewSize.Laptop);

  return (
    <nav
      aria-label="Squad directory navigation"
      className={classNames(
        'relative -mx-4 border-b border-border-subtlest-tertiary px-4 laptop:border-0',
        'flex-row flex-nowrap gap-2 laptop:flex',
        className,
      )}
      {...attrs}
    >
      {!isAtStart && isOverflowing && isLaptop && (
        <Button
          className="absolute right-full top-1/2 -translate-y-1/2"
          disabled={isAtStart}
          icon={<ArrowIcon className="-rotate-90" />}
          onClick={onClickPrevious}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Option}
        />
      )}
      <ul
        className="no-scrollbar relative flex flex-1 flex-row flex-nowrap gap-2 overflow-x-auto scroll-smooth "
        ref={ref}
      >
        {children}
      </ul>
      {!isAtEnd && isOverflowing && isLaptop && (
        <Button
          className="absolute left-full top-1/2 -translate-y-1/2 translate-x-2"
          disabled={isAtEnd}
          icon={<ArrowIcon className="rotate-90" />}
          onClick={onClickNext}
          size={ButtonSize.XSmall}
          variant={ButtonVariant.Option}
        />
      )}
    </nav>
  );
};
