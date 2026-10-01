import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ShellSquare } from '../shell/ShellSquare';
import { IconSize } from '../Icon';
import { FilterIcon, MiniCloseIcon } from '../icons';
import { Drawer, DrawerPosition } from '../drawers';
import {
  SearchFilterContentCurationList,
  SearchFilterPostTypeList,
  SearchFilterTimeList,
} from './SearchFilterOptions';

const SearchMobileFilterSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-2">
    <h3 className="font-bold text-text-primary typo-callout">{title}</h3>
    {children}
  </section>
);

// `square` is the block's form: the icon alone on the floating square.
const SearchMobileFiltersButton = ({
  square = false,
}: {
  square?: boolean;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {square ? (
        <ShellSquare
          aria-label="Open search filters"
          onClick={() => setIsOpen(true)}
        >
          <FilterIcon size={IconSize.Small} />
        </ShellSquare>
      ) : (
        <Button
          variant={ButtonVariant.Float}
          icon={<FilterIcon />}
          size={ButtonSize.Small}
          aria-label="Open search filters"
          onClick={() => setIsOpen(true)}
        >
          Filters
        </Button>
      )}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        position={DrawerPosition.Bottom}
        className={{ wrapper: 'gap-4 p-4' }}
      >
        <div className="flex shrink-0 items-center justify-between">
          <h2 className="font-bold text-text-primary typo-title3">Filters</h2>
          <Button
            type="button"
            icon={<MiniCloseIcon />}
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          />
        </div>
        <div className="flex flex-col gap-5">
          <SearchMobileFilterSection title="Time">
            <SearchFilterTimeList />
          </SearchMobileFilterSection>
          <SearchMobileFilterSection title="Content type">
            <SearchFilterPostTypeList />
          </SearchMobileFilterSection>
          <SearchMobileFilterSection title="Category">
            <SearchFilterContentCurationList />
          </SearchMobileFilterSection>
        </div>
      </Drawer>
    </>
  );
};

export default SearchMobileFiltersButton;
