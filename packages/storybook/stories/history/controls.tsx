import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import type { Filters, HistoryItem, Kind } from './data';
import { applyFilters, emptyFilters, kindLabels } from './data';
import { Segments } from '@dailydotdev/shared/src/components/shell/ShellRow';
import { useHistory } from './kit';

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

/** All, Articles, Videos: production's shell segments, one always on. */
export const KindSegments = ({
  state,
  onSelect,
}: {
  state: FilterState;
  onSelect: (kind: Kind) => void;
}): ReactElement => (
  <Segments
    items={(['all', 'article', 'video'] as Kind[]).map((kind) => ({
      key: kind,
      label: kindLabels[kind],
      active: state.filters.kind === kind,
      onClick: () => onSelect(kind),
    }))}
  />
);
