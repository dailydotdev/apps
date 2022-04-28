import React, { ReactElement } from 'react';
import { Author } from '../../graphql/comments';
import Rank from '../Rank';
import { ProfileImageLink } from './ProfileImageLink';
import { ProfileLink } from './ProfileLink';
import { TagLinks } from '../TagLinks';
import { UserTooltipContentData } from '../../hooks/useProfileTooltip';

export interface ProfileTooltipContentProps {
  user: Author;
  data?: UserTooltipContentData;
  onMouseEnter?: () => unknown;
  onMouseLeave?: () => unknown;
}

export function ProfileTooltipContent({
  user,
  data: { rank, tags },
  onMouseEnter,
  onMouseLeave,
}: ProfileTooltipContentProps): ReactElement {
  return (
    <div
      className="flex flex-col font-normal shrink typo-callout"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-fit">
        <ProfileImageLink user={user} picture={{ size: 'xxlarge' }} />
        {rank && (
          <Rank
            className="absolute -right-2 -bottom-2 w-6 h-6 rounded-8 bg-theme-bg-primary"
            rank={rank.currentRank}
            colorByRank
            data-testid={rank.currentRank}
          />
        )}
      </div>
      <ProfileLink
        className="mt-5 font-bold text-theme-label-primary"
        user={user}
      >
        {user.name}
      </ProfileLink>
      <ProfileLink className="mb-3 text-theme-label-secondary" user={user}>
        @{user.username}
      </ProfileLink>
      {user.bio && (
        <p className="mb-3 break-words line-clamp-3 text-theme-label-tertiary">
          {user.bio}
        </p>
      )}
      {tags?.length ? (
        <span className="mb-2 typo-subhead text-theme-label-quaternary">
          Loves reading about
        </span>
      ) : null}
      <TagLinks className="mb-0" tags={tags?.map(({ value }) => value) || []} />
    </div>
  );
}
