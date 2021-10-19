import React, { ReactElement, ReactNode } from 'react';
import classed from '../../lib/classed';
import sizeN from '../../../macros/sizeN.macro';
import { ElementPlaceholder } from '../ElementPlaceholder';
import { SummaryArrow } from '../utilities';

export const FiltersContainer = classed('div', 'flex flex-col w-full pb-4');
export interface MenuItem {
  icon?: ReactNode;
  title: string;
  action?: () => unknown;
  component?: () => unknown;
}

const Placeholder = (
  <div className="flex justify-between pr-4 pl-6">
    <ElementPlaceholder className="rounded-md" style={{ width: sizeN(30) }} />
    <ElementPlaceholder className="w-5 rounded-md" />
  </div>
);

export const FiltersPlaceholder = (): ReactElement => (
  <div
    className="grid grid-flow-row gap-y-7 mt-9"
    style={{ gridAutoRows: sizeN(5) }}
  >
    {Array(5).fill(Placeholder)}
  </div>
);

export const FiltersDetails = classed(
  'details',
  'p-6 border-t border-b border-theme-divider-tertiary right-icon',
);

export const FiltersHeadline = classed(
  'h3',
  'h-12 flex items-center typo-callout text-theme-label-tertiary',
);

export const FiltersSummaryArrow = (): ReactElement => (
  <SummaryArrow style={{ marginLeft: '0.5rem' }} />
);

export const FiltersList = classed('ul', 'flex flex-col p-0');

export const FilterItem = classed('li', 'flex items-center p-0');

export type FilterProps = {
  enableQueries?: boolean;
  query?: string;
};
