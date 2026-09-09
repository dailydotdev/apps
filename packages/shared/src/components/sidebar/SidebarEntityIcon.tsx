import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image, ImageType } from '../image/Image';
import { EarthIcon, HashtagIcon, LinkIcon, SquadIcon } from '../icons';
import { RAIL_ICON_SIZE } from './common';
import { pageIconForPath } from './pageIcons';
import { sourceImageQueryOptions } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';

const segments = (path: string): string[] =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean);

// A squad shortcut's handle is the segment right AFTER /squads/ — not the last
// one, which on a sub-page (/squads/<handle>/members) is the sub-page itself.
const squadHandleFromPath = (path: string): string => segments(path)[1] ?? '';

const stripOrigin = (path: string): string =>
  path.replace(/^https?:\/\/[^/]+/, '');

// Resolves the right glyph/image for a pinned page shortcut from its path — a
// squad shows its actual logo, sources/tags get their icon, and known app pages
// keep the glyph the row they were dragged from used — so a pinned page never
// falls back to a generic link icon when we can do better. Entries store the
// logo they were pinned with, so `image` renders immediately and nothing is
// fetched; the lookup only covers squad shortcuts pinned before that.
export const SidebarEntityIcon = ({
  path,
  image,
  active = false,
}: {
  path: string;
  image?: string;
  // Whether this shortcut is the page you're on. Vector glyphs switch to their
  // filled art, matching how the catalog shortcuts beside them behave.
  active?: boolean;
}): ReactElement => {
  const normalized = stripOrigin(path);
  const PageIcon = pageIconForPath(normalized);
  // `/squads/moderate` and friends are pages, not handles — resolving the page
  // first also keeps them from firing a lookup that can never resolve.
  const isSquad = !PageIcon && normalized.startsWith('/squads/');
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

  if (PageIcon) {
    return <PageIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />;
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
      <SquadIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />
    );
  }
  if (isSource) {
    return <EarthIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />;
  }
  if (isTag) {
    return <HashtagIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />;
  }
  return <LinkIcon secondary={active} size={RAIL_ICON_SIZE} aria-hidden />;
};
