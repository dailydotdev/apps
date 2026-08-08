import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { Tab, TabContainer } from '../../../components/tabs/TabContainer';
import { SearchField } from '../../../components/fields/SearchField';
import type { Deal } from '../types';
import {
  DEALS_FILTER_ALL,
  DEALS_FILTER_EXCLUSIVE,
  DEALS_FILTER_EXPIRING,
  getDealCategories,
  getDealCategoryPath,
  getDealsFilterPath,
} from '../dealsFormat';

interface DealsDirectoryHeaderProps {
  /** The set the tabs are built from, so a faceted page can still link to
   * every other category while rendering only its own deals. */
  deals: Deal[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  className?: string;
}

export const DealsDirectoryHeader = ({
  deals,
  activeFilter,
  onFilterChange,
  query,
  onQueryChange,
  className,
}: DealsDirectoryHeaderProps): ReactElement => {
  const filterToUrl = useMemo(() => {
    const categories = getDealCategories(deals).reduce<Record<string, string>>(
      (acc, category) => ({
        ...acc,
        [category]: getDealCategoryPath(category),
      }),
      {},
    );

    // The two cross-cutting tabs sit before the categories because the tab row
    // scrolls on every width we ship, and a filter nobody scrolls to is gone.
    return {
      [DEALS_FILTER_ALL]: getDealsFilterPath(DEALS_FILTER_ALL),
      [DEALS_FILTER_EXPIRING]: getDealsFilterPath(DEALS_FILTER_EXPIRING),
      [DEALS_FILTER_EXCLUSIVE]: getDealsFilterPath(DEALS_FILTER_EXCLUSIVE),
      ...categories,
    };
  }, [deals]);

  return (
    <div
      className={classNames(
        'flex flex-col-reverse gap-3 border-b border-border-subtlest-tertiary tablet:flex-row tablet:items-center tablet:gap-4',
        className,
      )}
    >
      <TabContainer
        controlledActive={activeFilter}
        onActiveChange={onFilterChange}
        showBorder={false}
        tabTag="a"
        className={{
          container: 'min-w-0 flex-1',
          header: 'no-scrollbar overflow-x-auto',
        }}
        tabListProps={{
          autoScrollActive: true,
          dragScroll: true,
          className: { item: 'px-0' },
        }}
      >
        {Object.entries(filterToUrl).map(([label, url]) => (
          <Tab key={label} label={label} url={url} />
        ))}
      </TabContainer>

      <SearchField
        inputId="deals-directory-search"
        placeholder="Search deals, brands or categories"
        aria-label="Search deals"
        fieldSize="medium"
        value={query}
        valueChanged={onQueryChange}
        className="w-full shrink-0 tablet:w-64"
      />
    </div>
  );
};
