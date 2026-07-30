import type { ReactElement } from 'react';
import React from 'react';
import { Image, ImageType } from '../image/Image';
import { EarthIcon, HashtagIcon, LinkIcon, SquadIcon } from '../icons';
import { RAIL_ICON_SIZE } from './common';
import { useSquad } from '../../hooks/squads/useSquad';

const handleFromPath = (path: string): string =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? '';

const stripOrigin = (path: string): string =>
  path.replace(/^https?:\/\/[^/]+/, '');

// Resolves the right glyph/image for a pinned page shortcut from its path — a
// squad shows its actual logo, sources/tags get their icon — so a pinned page
// never falls back to a generic link icon when we can do better. The squad
// lookup self-disables for non-squad paths, so only squad shortcuts fetch.
// When `image` is provided (captured at drag time) it renders immediately and
// the fetch is skipped entirely, so there's no placeholder flash.
export const SidebarEntityIcon = ({
  path,
  image,
}: {
  path: string;
  image?: string;
}): ReactElement => {
  const normalized = stripOrigin(path);
  const isSquad = normalized.startsWith('/squads/');
  const isSource = normalized.startsWith('/sources/');
  const isTag = normalized.startsWith('/tags/');
  // Only fetch when we don't already have the image in hand.
  const { squad } = useSquad({
    handle: isSquad && !image ? handleFromPath(path) : '',
  });

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
        className="size-[1.625rem] rounded-8 object-cover"
      />
    );
  }

  if (isSquad) {
    return squad?.image ? (
      <Image
        src={squad.image}
        type={ImageType.Squad}
        alt=""
        aria-hidden
        // Same rail glyph size as the fallbacks below.
        className="size-[1.625rem] rounded-8 object-cover"
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
