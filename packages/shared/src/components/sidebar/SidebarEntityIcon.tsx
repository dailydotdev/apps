import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image, ImageType } from '../image/Image';
import {
  BellIcon,
  BookmarkIcon,
  CompassIcon,
  EarthIcon,
  HashtagIcon,
  HotIcon,
  JobIcon,
  LinkIcon,
  SettingsIcon,
  SourceIcon,
  SquadIcon,
  TimerIcon,
} from '../icons';
import { RAIL_ICON_SIZE } from './common';
import { sourceImageQueryOptions } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';

const segments = (path: string): string[] =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean);

// A squad shortcut's handle is the segment right AFTER /squads/ — not the last
// one, which on a sub-page (/squads/<handle>/members) is the sub-page itself.
const squadHandleFromPath = (path: string): string => segments(path)[1] ?? '';

const stripOrigin = (path: string): string =>
  path.replace(/^https?:\/\/[^/]+/, '');

// App pages that are neither a catalog shortcut nor an entity, so the path is
// the only thing left to identify them by. Without this a pinned panel row
// loses the glyph it had in the panel: everything under /squads/ resolved as a
// squad handle (Pending Posts and Find Squads both pinned as the generic squad
// icon) and everything else fell through to the link icon. Keyed by exact
// normalized path and matched before the entity prefixes below.
const PAGE_ICONS: Record<string, () => ReactElement> = {
  '/posts': () => <CompassIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads': () => <SquadIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/new': () => <SquadIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/create': () => <SquadIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/moderate': () => <TimerIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/discover': () => <SourceIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/discover/my': () => <SourceIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/squads/discover/featured': () => (
    <SourceIcon size={RAIL_ICON_SIZE} aria-hidden />
  ),
  '/jobs': () => <JobIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/notifications': () => <BellIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/game-center': () => <HotIcon size={RAIL_ICON_SIZE} aria-hidden />,
  '/daily-quests': () => <HotIcon size={RAIL_ICON_SIZE} aria-hidden />,
};

// Sections whose sub-pages all read as the same thing (a settings page, a
// bookmark folder, a custom feed), so one glyph covers the whole subtree.
const PREFIX_ICONS: [string, () => ReactElement][] = [
  ['/settings', () => <SettingsIcon size={RAIL_ICON_SIZE} aria-hidden />],
  ['/bookmarks', () => <BookmarkIcon size={RAIL_ICON_SIZE} aria-hidden />],
  ['/feeds', () => <HashtagIcon size={RAIL_ICON_SIZE} aria-hidden />],
];

const pageIcon = (normalized: string): ReactElement | null => {
  const exact = PAGE_ICONS[normalized];
  if (exact) {
    return exact();
  }
  const prefixed = PREFIX_ICONS.find(
    ([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
  return prefixed ? prefixed[1]() : null;
};

// Resolves the right glyph/image for a pinned page shortcut from its path — a
// squad shows its actual logo, sources/tags get their icon, and known app pages
// keep the glyph the panel row they were dragged from used — so a pinned page
// never falls back to a generic link icon when we can do better. Entries store
// the logo they were pinned with, so `image` renders immediately and nothing is
// fetched; the lookup only covers squad shortcuts pinned before that.
export const SidebarEntityIcon = ({
  path,
  image,
}: {
  path: string;
  image?: string;
}): ReactElement => {
  const normalized = stripOrigin(path);
  const knownPage = pageIcon(normalized);
  // `/squads/moderate` and friends are pages, not handles — checking the page
  // map first also keeps them from firing a lookup that can never resolve.
  const isSquad = !knownPage && normalized.startsWith('/squads/');
  const isSource = normalized.startsWith('/sources/');
  const isTag = normalized.startsWith('/tags/');
  const { isFetched: isBootFetched } = useAuthContext();
  const { data: source } = useQuery(
    sourceImageQueryOptions({
      handle: isSquad ? squadHandleFromPath(normalized) : '',
      enabled: !!isBootFetched && !image,
    }),
  );

  if (image) {
    return (
      <Image
        src={image}
        type={ImageType.Squad}
        alt=""
        aria-hidden
        // Matches RAIL_ICON_SIZE so a dock row mixing real avatars with fallback
        // glyphs keeps one glyph size (the profile tab's avatar is deliberately
        // smaller — a solid photo carries more optical mass than an outline —
        // but that correction is for a lone avatar, not a mixed row).
        className="size-6 rounded-8 object-cover"
      />
    );
  }

  if (knownPage) {
    return knownPage;
  }

  if (isSquad) {
    return source?.image ? (
      <Image
        src={source.image}
        type={ImageType.Squad}
        alt=""
        aria-hidden
        // Same rail glyph size as the fallbacks below.
        className="size-6 rounded-8 object-cover"
      />
    ) : (
      <SquadIcon size={RAIL_ICON_SIZE} aria-hidden />
    );
  }
  if (isSource) {
    return <EarthIcon size={RAIL_ICON_SIZE} aria-hidden />;
  }
  if (isTag) {
    return <HashtagIcon size={RAIL_ICON_SIZE} aria-hidden />;
  }
  return <LinkIcon size={RAIL_ICON_SIZE} aria-hidden />;
};
