import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Filters, HistoryItem, Kind } from './data';
import { applyFilters, emptyFilters, kindLabels } from './data';
import { Chip, useHistory } from './kit';

/* -------------------------------------------------------------- filters */

export interface FilterState {
  filters: Filters;
  set: (patch: Partial<Filters>) => void;
  reset: () => void;
  results: HistoryItem[];
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
  };
};

export const KindChips = ({
  state,
  kinds = ['article', 'video', 'bookmarked'],
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
