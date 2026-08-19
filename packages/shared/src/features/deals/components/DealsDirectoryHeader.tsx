import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { ButtonSize } from '../../../components/buttons/Button';
import { pageHeaderClassName } from '../../../components/layout/PageHeader';
import {
  SquadDirectoryNavbar,
  SquadDirectoryNavbarItem,
} from '../../../components/squads/layout/SquadDirectoryNavbar';
import { SearchField } from '../../../components/fields/SearchField';
import type { Deal } from '../types';
import {
  DEALS_FILTER_ALL,
  DEALS_FILTER_EXCLUSIVE,
  DEALS_FILTER_EXPIRING,
  DEALS_MY_COUPONS_PATH,
  DEALS_TAB_MY_COUPONS,
  getDealCategories,
  getDealCategoryPath,
  getDealsFilterPath,
} from '../dealsFormat';

interface DealsDirectoryHeaderProps {
  /** The set the tabs are built from, so a faceted page can still link to
   * every other category while rendering only its own deals. */
  deals: Deal[];
  activeFilter: string;
  /** Omitted on the wallet route, where a deals search would filter nothing. */
  query?: string;
  onQueryChange?: (query: string) => void;
  className?: string;
}

export const DealsDirectoryHeader = ({
  deals,
  activeFilter,
  query,
  onQueryChange,
  className,
}: DealsDirectoryHeaderProps): ReactElement => {
  const tabs = useMemo(() => {
    const categories = getDealCategories(deals).map((category) => ({
      label: category,
      path: getDealCategoryPath(category),
    }));

    // The two cross-cutting tabs sit before the categories because the tab row
    // scrolls on every width we ship, and a filter nobody scrolls to is gone.
    return [
      { label: DEALS_TAB_MY_COUPONS, path: DEALS_MY_COUPONS_PATH },
      { label: DEALS_FILTER_ALL, path: getDealsFilterPath(DEALS_FILTER_ALL) },
      {
        label: DEALS_FILTER_EXPIRING,
        path: getDealsFilterPath(DEALS_FILTER_EXPIRING),
      },
      {
        label: DEALS_FILTER_EXCLUSIVE,
        path: getDealsFilterPath(DEALS_FILTER_EXCLUSIVE),
      },
      ...categories,
    ];
  }, [deals]);

  return (
    <header
      className={classNames(pageHeaderClassName, 'gap-4 !py-0', className)}
    >
      <SquadDirectoryNavbar
        aria-label="Deals navigation"
        className="!mx-0 min-w-0 flex-1 !border-0 !px-0"
      >
        {tabs.map(({ label, path }) => (
          <SquadDirectoryNavbarItem
            key={label}
            buttonSize={ButtonSize.Small}
            isActive={label === activeFilter}
            label={label}
            path={path}
            ariaLabel={label}
          />
        ))}
      </SquadDirectoryNavbar>

      {onQueryChange && (
        <SearchField
          inputId="deals-directory-search"
          placeholder="Search deals"
          aria-label="Search deals"
          fieldSize="medium"
          value={query ?? ''}
          valueChanged={onQueryChange}
          // The navbar parks its scroll-next arrow outside its own box, so the
          // search has to start past it rather than under it.
          className="ml-4 w-40 shrink-0 tablet:w-64"
        />
      )}
    </header>
  );
};
