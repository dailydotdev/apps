import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Image, ImageType } from '../image/Image';
import { EarthIcon, HashtagIcon, LinkIcon, SquadIcon } from '../icons';
import { RAIL_ICON_SIZE } from './common';
import { sourceImageQueryOptions } from '../../graphql/sources';
import { useAuthContext } from '../../contexts/AuthContext';

const handleFromPath = (path: string): string =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? '';

const stripOrigin = (path: string): string =>
  path.replace(/^https?:\/\/[^/]+/, '');

// Resolves the right glyph/image for a pinned page shortcut from its path — a
// squad shows its actual logo, sources/tags get their icon — so a pinned page
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
  const isSquad = normalized.startsWith('/squads/');
  const isSource = normalized.startsWith('/sources/');
  const isTag = normalized.startsWith('/tags/');
  const { isFetched: isBootFetched } = useAuthContext();
  const { data: source } = useQuery(
    sourceImageQueryOptions({
      handle: isSquad ? handleFromPath(path) : '',
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
