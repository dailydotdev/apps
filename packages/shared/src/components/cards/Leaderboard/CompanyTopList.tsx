import type { ReactElement } from 'react';
import React from 'react';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import type { Company } from '../../../lib/userCompany';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { indexToEmoji } from './common';

export interface CompanyLeaderboard {
  score: number;
  company: Company;
}

export function CompanyTopList({
  items,
  ...props
}: CommonLeaderboardProps<CompanyLeaderboard[]>): ReactElement {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.company.name}
          index={i + 1}
          className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler"
        >
          <span className="pl-1">{indexToEmoji(i)}</span>
          <div className="relative flex min-w-0 flex-shrink flex-row items-center gap-4 p-2">
            <ProfilePicture
              size={ProfileImageSize.Medium}
              user={{
                image: item.company.image,
                id: item.company.name,
              }}
              rounded="full"
            />
            {item.company.name}
          </div>
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
}
