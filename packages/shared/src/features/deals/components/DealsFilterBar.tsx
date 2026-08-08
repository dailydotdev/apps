import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { Button } from '../../../components/buttons/Button';
import { ButtonSize, ButtonVariant } from '../../../components/buttons/common';
import type { Deal } from '../types';
import { DealState, DealType } from '../types';
import { getDealCategoryPath } from '../dealsFormat';

export const DEALS_FILTER_ALL = 'All';
export const DEALS_FILTER_EXPIRING = 'Expiring';
export const DEALS_FILTER_EXCLUSIVE = 'Exclusive';

interface DealsFilterBarProps {
  deals: Deal[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  /** Renders category chips as crawlable links to their own directory page. */
  withCategoryLinks?: boolean;
  className?: string;
}

export const getDealCategories = (deals: Deal[]): string[] =>
  Array.from(new Set(deals.flatMap((deal) => deal.categories))).sort((a, b) =>
    a.localeCompare(b),
  );

export const matchesDealFilter = (deal: Deal, filter: string): boolean => {
  if (filter === DEALS_FILTER_ALL) {
    return true;
  }

  if (filter === DEALS_FILTER_EXPIRING) {
    return deal.state === DealState.Expiring;
  }

  if (filter === DEALS_FILTER_EXCLUSIVE) {
    return deal.type === DealType.Exclusive;
  }

  return deal.categories.includes(filter);
};

export const DealsFilterBar = ({
  deals,
  activeFilter,
  onFilterChange,
  withCategoryLinks = false,
  className,
}: DealsFilterBarProps): ReactElement => {
  const categories = useMemo(() => getDealCategories(deals), [deals]);
  const filters = useMemo(
    () => [
      DEALS_FILTER_ALL,
      ...categories,
      DEALS_FILTER_EXPIRING,
      DEALS_FILTER_EXCLUSIVE,
    ],
    [categories],
  );

  return (
    <div
      className={classNames(
        'no-scrollbar flex items-center gap-2 overflow-x-auto',
        className,
      )}
      role="group"
      aria-label="Filter deals"
    >
      {filters.map((filter) => {
        const isActive = filter === activeFilter;
        const variant = isActive ? ButtonVariant.Primary : ButtonVariant.Float;

        if (withCategoryLinks && categories.includes(filter)) {
          return (
            <Link key={filter} href={getDealCategoryPath(filter)} passHref>
              <Button
                tag="a"
                size={ButtonSize.Small}
                variant={variant}
                pressed={isActive}
                className="shrink-0"
              >
                {filter}
              </Button>
            </Link>
          );
        }

        return (
          <Button
            key={filter}
            type="button"
            size={ButtonSize.Small}
            variant={variant}
            pressed={isActive}
            onClick={() => onFilterChange(filter)}
            className="shrink-0"
          >
            {filter}
          </Button>
        );
      })}
    </div>
  );
};
