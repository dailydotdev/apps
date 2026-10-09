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
// When the menu has owner or moderation rows (your own post, or a squad
// moderator's delete and pin on anyone's), Hide waits under Not interested
// so the sheet still fits a small phone: at 375x667 it holds about nine
// 48px rows, and those rows plus Hide on the first level run past that.
// Options keep their handlers; only the grouping is decided here, by id.
export const groupPostOptions = (
  options: MenuItemProps[],
): PostOptionGroups => {
  const owner = options
    .filter((option) => ownerOrder.includes(option.id ?? ''))
    .sort(sortBy(ownerOrder));
  const hideFirst = owner.length === 0;
  const isPrimary = (id: string) =>
    primaryOrder.includes(id) && (hideFirst || id !== 'hide');
  const primary = options
    .filter((option) => isPrimary(option.id ?? ''))
    .sort(sortBy(primaryOrder));
  const notInterested = options.filter(
    (option) =>
      notInterestedIds.includes(option.id ?? '') ||
      (!hideFirst && option.id === 'hide'),
  );
  const placed = new Set([...primary, ...notInterested, ...owner]);
  const more = options.filter((option) => !placed.has(option));

  return { primary, notInterested, owner, more };
};
