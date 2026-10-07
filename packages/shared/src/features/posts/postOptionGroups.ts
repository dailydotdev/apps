import type { MenuItemProps } from '../../components/dropdown/common';

export interface PostOptionGroups {
  primary: MenuItemProps[];
  notInterested: MenuItemProps[];
  owner: MenuItemProps[];
  more: MenuItemProps[];
}

const primaryOrder = [
  'share',
  'follow-source',
  'follow-author',
  'later',
  'hide',
  'report',
];
const notInterestedIds = [
  'block-source',
  'block-author',
  'block-tag',
  'content-type',
];
const ownerOrder = ['edit', 'delete', 'analytics', 'boost', 'pin'];

const sortBy = (ids: string[]) => (a: MenuItemProps, b: MenuItemProps) =>
  ids.indexOf(a.id ?? '') - ids.indexOf(b.id ?? '');

// The phone's post menu: the first level is Share, the follows (source and
// author, so following is never behind More), Read it later, Hide, Not
// interested and Report, then the owner's rows, then More for everything
// else; Not interested gathers every other way of seeing less of this.
// Options keep their handlers; only the grouping is decided here, by id.
export const groupPostOptions = (
  options: MenuItemProps[],
): PostOptionGroups => {
  const primary = options
    .filter((option) => primaryOrder.includes(option.id ?? ''))
    .sort(sortBy(primaryOrder));
  const notInterested = options.filter((option) =>
    notInterestedIds.includes(option.id ?? ''),
  );
  const owner = options
    .filter((option) => ownerOrder.includes(option.id ?? ''))
    .sort(sortBy(ownerOrder));
  const placed = new Set([...primary, ...notInterested, ...owner]);
  const more = options.filter((option) => !placed.has(option));

  return { primary, notInterested, owner, more };
};
