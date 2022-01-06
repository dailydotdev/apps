import { ReactNode } from 'react';
import { Source } from '../../graphql/sources';
import classed from '../../lib/classed';

export type BooleanPromise = Promise<{ successful: boolean }>;

export interface MenuItem {
  icon?: ReactNode;
  title: string;
  action?: () => unknown;
  component?: ReactNode;
}

export interface FilterMenuProps {
  onUnblockItem?: ({ tag, source, action }: UnblockModalType) => void;
}

export interface UnblockModalType {
  tag?: string;
  source?: Source;
  action?: () => unknown;
}

export const TagCategoryDetails = classed(
  'details',
  'border-t border-b border-theme-divider-tertiary right-icon cursor-pointer',
);

export const TagCategorySummary = classed(
  'summary',
  'flex justify-between items-center p-6 pl-4 outline-none',
);

export const TagCategoryDetailsContent = classed(
  'div',
  'flex flex-wrap px-6 pb-6 pt-2',
);

export const FiltersList = classed('ul', 'flex flex-col p-0');

export const FilterItem = classed('li', 'flex items-center p-0');
