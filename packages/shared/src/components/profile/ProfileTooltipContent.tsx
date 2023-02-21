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
      className="flex shrink flex-col font-normal typo-callout"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="relative w-fit">
        <ProfileImageLink user={user} picture={{ size: 'xxlarge' }} />
        {rank && (
          <Rank
            className="absolute -right-2 -bottom-2 h-6 w-6 rounded-8 bg-theme-bg-primary"
            rank={rank.currentRank}
            colorByRank
            data-testid={rank.currentRank}
          />
        )}
      </div>
      <ProfileLink
        className="mt-5 font-bold text-theme-label-primary"
        href={user.permalink}
      >
        {user.name}
      </ProfileLink>
      <ProfileLink
        className="mb-3 text-theme-label-secondary"
        href={user.permalink}
      >
        @{user.username}
      </ProfileLink>
      {user.bio && (
        <p className="mb-3 break-words text-theme-label-tertiary line-clamp-3">
          {user.bio}
        </p>
      )}
      {tags?.length ? (
        <span className="mb-2 text-theme-label-quaternary typo-subhead">
          Loves reading about
        </span>
      ) : null}
      <TagLinks className="mb-0" tags={tags?.map(({ value }) => value) || []} />
    </div>
  );
}
