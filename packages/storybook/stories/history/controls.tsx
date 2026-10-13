import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Filters, HistoryItem, Kind, Range } from './data';
import { applyFilters, emptyFilters, kindLabels, rangeLabels } from './data';
import { Chip, useHistory } from './kit';

/* -------------------------------------------------------------- filters */

export interface FilterState {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
  results: HistoryItem[];
  active: boolean;
}

export const useFilters = (initial: Partial<Filters> = {}): FilterState => {
  const { items } = useHistory();
  const [filters, setFilters] = useState<Filters>({
    ...emptyFilters,
    ...initial,
  });
  const results = useMemo(() => applyFilters(items, filters), [items, filters]);
  return {
    filters,
    set: (patch) => setFilters((current) => ({ ...current, ...patch })),
    reset: () => setFilters(emptyFilters),
    results,
    active:
      !!filters.query.trim() ||
      filters.range !== 'all' ||
      filters.kind !== 'all' ||
      !!filters.tag ||
      !!filters.source,
  };
};

export const RangeChips = ({
  state,
  ranges = ['all', 'today', 'week', 'month'],
}: {
  state: FilterState;
  ranges?: Range[];
}): ReactElement => (
  <>
    {ranges.map((range) => (
      <Chip
        key={range}
        active={state.filters.range === range}
        onClick={() =>
          state.set({
            range: state.filters.range === range ? 'all' : range,
          })
        }
      >
        {rangeLabels[range]}
      </Chip>
    ))}
  </>
);

export const KindChips = ({
  state,
  kinds = ['all', 'article', 'video', 'bookmarked', 'upvoted'],
}: {
  state: FilterState;
  kinds?: Kind[];
}): ReactElement => (
  <>
    {kinds.map((kind) => (
      <Chip
        key={kind}
        active={state.filters.kind === kind}
        onClick={() =>
          state.set({ kind: state.filters.kind === kind ? 'all' : kind })
        }
      >
        {kindLabels[kind]}
      </Chip>
    ))}
  </>
);
