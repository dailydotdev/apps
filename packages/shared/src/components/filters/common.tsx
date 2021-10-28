import { ReactNode } from 'react';
import { Source } from '../../graphql/sources';
import classed from '../../lib/classed';

export interface MenuItem {
  icon?: ReactNode;
  title: string;
  action?: () => unknown;
  component?: () => unknown;
}

export interface UnblockModalType {
  tag?: string;
  source?: Source;
  showUnblockModal?: boolean;
  action?: () => unknown;
}

export const TagCategoryDetails = classed(
  'details',
  'p-6 border-t border-b border-theme-divider-tertiary right-icon',
);

export const TagCategorySummary = classed(
  'summary',
  'flex justify-between items-center',
);

export const TagCategoryDetailsContent = classed(
  'div',
  'flex flex-wrap py-6 pt-8',
);

export const FiltersList = classed('ul', 'flex flex-col p-0');

export const FilterItem = classed('li', 'flex items-center p-0');
