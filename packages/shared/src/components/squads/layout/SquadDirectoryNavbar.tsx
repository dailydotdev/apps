import type { ComponentProps, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../../buttons/Button';
import { useHorizontalScrollHeader } from '../../HorizontalScroll/useHorizontalScrollHeader';
import { ArrowIcon } from '../../icons';
import { useViewSize, ViewSize } from '../../../hooks';

export { SquadDirectoryNavbarItem } from './SquadDirectoryNavbarItem';

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
    title: { copy: 'Squad directory navigation' },
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
