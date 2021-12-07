import React, { ReactElement } from 'react';
import request from 'graphql-request';
import { useQuery } from 'react-query';
import {
  UserTooltipContentData,
  USER_TOOLTIP_CONTENT_QUERY,
} from '../../graphql/users';
import { apiUrl } from '../../lib/config';
import { Author } from '../../graphql/comments';
import Rank from '../Rank';
import { ProfileImageLink } from './ProfileImageLink';
import { ProfileLink } from './ProfileLink';
import { TagLinks } from '../TagLinks';

export interface ProfileTooltipContentProps {
  user: Author;
}

export function ProfileTooltipContent({
  user,
}: ProfileTooltipContentProps): ReactElement {
  const key = ['readingRank', user.id];
  const { data: { rank, tags } = {} } = useQuery<UserTooltipContentData>(
    key,
    () =>
      request(`${apiUrl}/graphql`, USER_TOOLTIP_CONTENT_QUERY, { id: user.id }),
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="flex flex-col flex-shrink font-normal typo-callout">
      <div className="relative w-fit">
        <ProfileImageLink user={user} picture={{ size: 'xxlarge' }} />
        {rank && (
          <Rank
            className="absolute -right-2 -bottom-2 rounded-8 bg-theme-bg-primary"
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
        <p className="mb-3 line-clamp-3 text-theme-label-tertiary">
          {user.bio}
        </p>
      )}
      {tags?.length && (
        <span className="typo-subhead text-theme-label-quaternary">
          Loves reading about
        </span>
      )}
      <TagLinks className="mb-0" tags={tags?.map(({ value }) => value) || []} />
    </div>
  );
}
