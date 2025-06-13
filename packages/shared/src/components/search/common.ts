import classed from '../../lib/classed';

export const SearchHistoryContainer = classed('div', 'flex flex-col gap-3 p-6');
export const TIME_OPTIONS = [
  'All time',
  'Today',
  'Yesterday',
  'Last 7 days',
  'Last 30 days',
  'Last month',
  'This year',
  'Last year',
] as const;
