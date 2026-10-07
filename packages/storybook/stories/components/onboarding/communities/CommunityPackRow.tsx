import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { largeNumberFormat } from '@dailydotdev/shared/src/lib/numberFormat';
import type { CommunityPack } from './communityPacks';
import type { PackCoverVariant } from './PackCover';
import { PackCover } from './PackCover';

// Squad members plus source followers across the pack. Someone in two of them
// counts twice, so this is the pack's reach, never a head count.
const packFollowers = ({ members }: CommunityPack): string =>
  largeNumberFormat(
    members.reduce((sum, { membersCount }) => sum + (membersCount ?? 0), 0),
  ) ?? '0';

// Everyone in the pack by name, the cover faces first. A Squad named after
// the topic is left out, since it would only repeat the title above it.
const packNames = ({ members, title }: CommunityPack): string =>
  members
    .map(({ name }) => name.trim())
    .filter((name) => name.toLowerCase() !== title.toLowerCase())
    .join(', ');

// X's "Who to follow" row with a pack in the person's place: the square cover
// as the avatar, followers right under the title, the members' names below.
export const CommunityPackRow = ({
  pack,
  isJoined,
  onToggle,
  cover,
}: {
  pack: CommunityPack;
  isJoined: boolean;
  onToggle: () => void;
  cover?: PackCoverVariant;
}): ReactElement => (
  <li className="flex items-start gap-4 py-3">
    <PackCover isJoined={isJoined} members={pack.members} variant={cover} />
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="line-clamp-2 break-words font-bold text-text-primary typo-body">
        {pack.title}
      </span>
      <span className="truncate font-medium text-text-secondary typo-callout">
        {packFollowers(pack)} followers
      </span>
      <span className="line-clamp-2 text-text-tertiary typo-footnote">
        {packNames(pack)}
      </span>
    </span>
    <Button
      aria-label={`${isJoined ? 'Leave' : 'Join'} the ${pack.title} pack`}
      aria-pressed={isJoined}
      // One width for both states, so joining never shifts the row.
      className="w-[5.25rem] shrink-0 !px-2"
      icon={isJoined ? <VIcon size={IconSize.Size16} /> : undefined}
      onClick={onToggle}
      size={ButtonSize.Small}
      type="button"
      // Joined steps back to a quiet fill, so the open packs keep the
      // attention.
      variant={isJoined ? ButtonVariant.Float : ButtonVariant.Primary}
    >
      {isJoined ? 'Joined' : 'Join'}
    </Button>
  </li>
);
