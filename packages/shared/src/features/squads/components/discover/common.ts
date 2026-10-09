import type { Ad } from '../../../../graphql/posts';
import type { Squad } from '../../../../graphql/sources';
import type { SourcesQueryProps } from '../../../../hooks/source/useSources';
import { cloudinarySquadsDirectoryCardBannerDefault } from '../../../../lib/image';
import { largeNumberFormat } from '../../../../lib/numberFormat';
import { hasSquadFeature } from '../../lib/features';

// "4 members" next to a squad reads as a warning rather than social proof, so
// squads still finding their first members say so instead.
export const NEW_SQUAD_MEMBER_THRESHOLD = 50;

export const getSquadMembersLabel = (count: number): string =>
  count < NEW_SQUAD_MEMBER_THRESHOLD
    ? 'New Squad'
    : `${largeNumberFormat(count)} members`;

export const isVerifiedSquad = (squad: Pick<Squad, 'features'>): boolean =>
  hasSquadFeature(squad, 'verified');

// Featured squads live only in the Featured area, so every other list leaves
// them out instead of repeating them.
export const isBrowsableSquad = (squad: Pick<Squad, 'flags'>): boolean =>
  !squad.flags?.featured;

export const getSquadBanner = (squad: Pick<Squad, 'headerImage'>): string =>
  squad.headerImage || cloudinarySquadsDirectoryCardBannerDefault;

export const featuredSquadsQuery: SourcesQueryProps = {
  featured: true,
  isPublic: true,
  first: 20,
};

// Fetches more than it shows: featured squads are filtered out client side.
export const popularSquadsQuery: SourcesQueryProps = {
  isPublic: true,
  sortByMembersCount: true,
  first: 30,
};

export const POPULAR_SQUADS_LIMIT = 9;

export interface SquadSlot {
  squad: Squad;
  /** Set on the promoted slot. */
  ad?: Ad;
}

// The promoted squad takes a fixed slot, second by default, in the same card
// as organic squads. A squad never shows twice, so its organic copy goes.
export const withPromotedSlot = (
  squads: Squad[],
  promoted: { ad?: Ad; squad?: Squad },
  position = 1,
): SquadSlot[] => {
  const { ad, squad: promotedSquad } = promoted;
  const slots: SquadSlot[] = squads
    .filter((squad) => squad.id !== promotedSquad?.id)
    .map((squad) => ({ squad }));

  if (ad && promotedSquad) {
    slots.splice(position, 0, { squad: promotedSquad, ad });
  }

  return slots;
};
