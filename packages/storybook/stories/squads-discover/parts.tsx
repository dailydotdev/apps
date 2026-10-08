import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { SearchIcon } from '@dailydotdev/shared/src/components/icons';
import { GroupLabel } from './kit';
import type { DiscoverSquad } from './data';
import {
  categories,
  categoryTitle,
  featuredSquads,
  promotedFor,
  topByCategory,
} from './data';

/* -------------------------------------------------------------- filters */

/** What a view lists: Featured, or a topic. */
const listFor = (chip: string): DiscoverSquad[] =>
  chip === 'featured' ? featuredSquads : topByCategory(chip);

export interface Slot {
  squad: DiscoverSquad;
  promoted: boolean;
  /** Set on the first slot of a group (verified companies, community). */
  groupLabel?: string;
}

export const isTopicChip = (chip: string): boolean =>
  categories.some((category) => category.slug === chip);

/**
 * The sponsored slot: a fixed, predictable position (second by default),
 * in the same card as organic squads with the label in front. A squad
 * never shows twice, so the organic copy of the promoted squad is dropped.
 */
export const withPromoted = (
  list: DiscoverSquad[],
  chip: string,
  position = 1,
): Slot[] => {
  const promoted = promotedFor(chip);
  const slots: Slot[] = list
    .filter((item) => item.id !== promoted.id)
    .map((squad) => ({ squad, promoted: false }));
  slots.splice(position, 0, { squad: promoted, promoted: true });
  return slots;
};

/**
 * A view's slots. On a topic, Verified Company Squads lead under their own
 * label (they rank first by design), and the promoted squad takes the
 * second community slot so it never splits the verified group. Elsewhere
 * it is simply the second item. Promoted can be verified, featured or a
 * regular squad; the slot and label are the same for all three.
 */
export const slotsFor = (chip: string, limit = 18): Slot[] => {
  const promoted = promotedFor(chip);
  const organic = listFor(chip).filter((item) => item.id !== promoted.id);
  const slots: Slot[] = organic.map((squad) => ({ squad, promoted: false }));
  const verifiedCount = isTopicChip(chip)
    ? organic.filter((item) => item.verified).length
    : 0;
  slots.splice(verifiedCount ? verifiedCount + 1 : 1, 0, {
    squad: promoted,
    promoted: true,
  });
  if (verifiedCount) {
    slots[0] = {
      ...slots[0],
      groupLabel: 'Verified company Squads',
    };
    slots[verifiedCount] = {
      ...slots[verifiedCount],
      groupLabel: `More in ${categoryTitle(chip)}`,
    };
  }
  return slots.slice(0, limit);
};

/** A slot's node, preceded by its group label when it opens a group. */
export const grouped = (slot: Slot, node: ReactNode): ReactNode => (
  <React.Fragment key={slot.squad.id}>
    {slot.groupLabel && <GroupLabel label={slot.groupLabel} />}
    {node}
  </React.Fragment>
);

/* -------------------------------------------------------------- header */

/**
 * Opens production's search for this page. Production already scopes
 * Spotlight to squads (`openWithScope(SpotlightScope.Squads)`, the
 * "Squads" pill), so the page's search field is a trigger for that
 * rather than a search of its own. Unset in the static frames.
 */
export const SquadSearchContext = createContext<(() => void) | undefined>(
  undefined,
);

/** The same search as the field, as an icon for tight headers. */
export const SearchButton = (): ReactElement => {
  const openSearch = useContext(SquadSearchContext);
  return (
    <Button
      type="button"
      size={ButtonSize.Small}
      variant={ButtonVariant.Tertiary}
      icon={<SearchIcon />}
      aria-label="Search Squads"
      onClick={() => openSearch?.()}
    />
  );
};

export const Gutter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('px-4 laptop:px-6', className)}>{children}</div>
);
