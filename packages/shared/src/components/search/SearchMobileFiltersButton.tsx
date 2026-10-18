import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { ShellSquare } from '../shell/ShellSquare';
import { IconSize } from '../Icon';
import { FilterIcon, SortIcon } from '../icons';
import { Drawer, DrawerPosition } from '../drawers';
import {
  SearchFilterContentCurationList,
  SearchFilterPostTypeList,
  SearchFilterTimeList,
  useSearchContentTypeOptions,
  useSearchContentCurationOptions,
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

const SearchMobileFiltersButton = ({
  square = false,
}: {
  square?: boolean;
}): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  // The two lists come from the member's advanced settings; a visitor has
  // none, and a heading over nothing reads as a dead button.
  const hasContentTypes = useSearchContentTypeOptions().length > 0;
  const hasCategories = useSearchContentCurationOptions().length > 0;

  return (
    <>
      {square ? (
        <ShellSquare
          aria-label="Sort results by time"
          onClick={() => setIsOpen(true)}
        >
          <SortIcon size={IconSize.Small} />
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
        appendOnRoot
        title={square ? 'Time' : 'Filters'}
        className={{ drawer: 'px-4 pb-4 pt-2' }}
      >
        <div className="flex flex-col gap-5">
          {square ? (
            // The block's square is the sort of the results: the sheet is
            // the time choice alone, titled as such, and a pick closes it.
            <SearchFilterTimeList onSelect={() => setIsOpen(false)} />
          ) : (
            <SearchMobileFilterSection title="Time">
              <SearchFilterTimeList />
            </SearchMobileFilterSection>
          )}
          {!square && hasContentTypes && (
            <SearchMobileFilterSection title="Content type">
              <SearchFilterPostTypeList />
            </SearchMobileFilterSection>
          )}
          {!square && hasCategories && (
            <SearchMobileFilterSection title="Category">
              <SearchFilterContentCurationList />
            </SearchMobileFilterSection>
          )}
        </div>
      </Drawer>
    </>
  );
};

export default SearchMobileFiltersButton;
