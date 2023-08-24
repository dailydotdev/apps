import classed from '@dailydotdev/shared/src/lib/classed';

export enum HistoryType {
  Reading = 'Reading history',
  Search = 'Search history',
}

export const SearchHistoryContainer = classed('div', 'flex flex-col gap-3 p-6');
