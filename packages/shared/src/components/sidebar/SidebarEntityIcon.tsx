import type { ReactElement } from 'react';
import React from 'react';
import { Image, ImageType } from '../image/Image';
import { EarthIcon, HashtagIcon, LinkIcon, SquadIcon } from '../icons';
import { IconSize } from '../Icon';
import { useSquad } from '../../hooks/squads/useSquad';

const handleFromPath = (path: string): string =>
  path.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() ?? '';

const stripOrigin = (path: string): string =>
  path.replace(/^https?:\/\/[^/]+/, '');

// Resolves the right glyph/image for a pinned page shortcut from its path — a
// squad shows its actual logo, sources/tags get their icon — so a pinned page
// never falls back to a generic link icon when we can do better. The squad
// lookup self-disables for non-squad paths, so only squad shortcuts fetch.
export const SidebarEntityIcon = ({ path }: { path: string }): ReactElement => {
  const normalized = stripOrigin(path);
  const isSquad = normalized.startsWith('/squads/');
  const isSource = normalized.startsWith('/sources/');
  const isTag = normalized.startsWith('/tags/');
  const { squad } = useSquad({ handle: isSquad ? handleFromPath(path) : '' });

  if (isSquad) {
    return squad?.image ? (
      <Image
        src={squad.image}
        type={ImageType.Squad}
        alt=""
        aria-hidden
        className="size-6 rounded-8 object-cover"
      />
    ) : (
      <SquadIcon size={IconSize.Small} aria-hidden />
    );
  }
  if (isSource) {
    return <EarthIcon size={IconSize.Small} aria-hidden />;
  }
  if (isTag) {
    return <HashtagIcon size={IconSize.Small} aria-hidden />;
  }
  return <LinkIcon size={IconSize.Small} aria-hidden />;
};
