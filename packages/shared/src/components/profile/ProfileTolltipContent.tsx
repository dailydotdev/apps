import React, { ReactElement } from 'react';
import request from 'graphql-request';
import { useQuery } from 'react-query';
import {
  UserReadingRankData,
  USER_READING_RANK_QUERY,
} from '../../graphql/users';
import { apiUrl } from '../../lib/config';
import { Author } from '../../graphql/comments';
import Rank from '../Rank';
import { ProfileImageLink } from './ProfileImageLink';
import { ProfileLink } from './ProfileLink';

export interface ProfileTooltipContentProps {
  user: Author;
}

export function ProfileTooltipContent({
  user,
}: ProfileTooltipContentProps): ReactElement {
  const key = ['readingRank', user.id];
  const { data: { userReadingRank } = {} } = useQuery<UserReadingRankData>(
    key,
    () =>
      request(`${apiUrl}/graphql`, USER_READING_RANK_QUERY, { id: user.id }),
    { refetchOnWindowFocus: false },
  );

  return (
    <div className="flex flex-col flex-shrink font-normal typo-callout">
      <div className="relative w-fit">
        <ProfileImageLink user={user} picture={{ size: 'xxlarge' }} />
        {userReadingRank && (
          <Rank
            className="absolute -right-2 -bottom-2 rounded-8 bg-theme-bg-primary"
            rank={userReadingRank.currentRank}
            colorByRank
            data-testid={userReadingRank.currentRank}
          />
        )}
      </div>
      <ProfileLink
        className="mt-5 font-bold text-theme-label-primary"
        user={user}
      >
        {user.name}
      </ProfileLink>
      <ProfileLink className="text-theme-label-secondary" user={user}>
        @{user.username}
      </ProfileLink>
      {user.bio && (
        <p className="mt-3 line-clamp-3 text-theme-label-tertiary">
          {user.bio}
        </p>
      )}
    </div>
  );
}
