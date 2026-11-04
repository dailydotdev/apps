import { useRef } from 'react';

/**
 * Keeps lists in the order and grouping they had when they opened, so a
 * click shows its result in place instead of moving rows. A row stays in its
 * first list even when its state would put it in another, and rows that
 * appear later join the end of theirs. Opening again sorts afresh.
 */
export const useFrozenGroups = <Group extends string>(
  groups: Record<Group, string[]>,
): Record<Group, string[]> => {
  const frozen = useRef<{ order: string[]; groupOf: Map<string, Group> }>({
    order: [],
    groupOf: new Map(),
  });
  const names = Object.keys(groups) as Group[];
  names.forEach((group) =>
    groups[group].forEach((key) => {
      if (!frozen.current.groupOf.has(key)) {
        frozen.current.groupOf.set(key, group);
        frozen.current.order.push(key);
      }
    }),
  );
  const result = Object.fromEntries(
    names.map((group) => [group, [] as string[]]),
  ) as Record<Group, string[]>;
  frozen.current.order.forEach((key) => {
    const group = frozen.current.groupOf.get(key);
    if (group && result[group]) {
      result[group].push(key);
    }
  });
  return result;
};
