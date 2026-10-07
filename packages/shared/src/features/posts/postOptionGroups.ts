import type { MenuItemProps } from '../../components/dropdown/common';

export interface PostOptionGroups {
  primary: MenuItemProps[];
  notInterested: MenuItemProps[];
  owner: MenuItemProps[];
  more: MenuItemProps[];
}

const primaryOrder = ['share', 'later', 'follow-source', 'report'];
const notInterestedIds = [
  'hide',
  'block-source',
  'block-author',
  'block-tag',
  'content-type',
];
const ownerOrder = ['edit', 'delete', 'analytics', 'boost', 'pin'];

const sortBy = (ids: string[]) => (a: MenuItemProps, b: MenuItemProps) =>
  ids.indexOf(a.id ?? '') - ids.indexOf(b.id ?? '');

// The phone's post menu: seven rows at most on the first level (Share,
// Read it later, Follow the source, Not interested, Report), then the
// owner's rows, then More for everything else; Not interested gathers
// every way of seeing less of this. Options keep their handlers; only the
// grouping is decided here, by id.
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
