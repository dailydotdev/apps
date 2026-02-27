import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import type { Company } from '../../../lib/userCompany';
import { ProfileImageSize, ProfilePicture } from '../../ProfilePicture';
import { runIconPopAnimation, runSparkAnimation, TOP_RANK_STYLES } from './common';
import { TopRankBadge } from './TopRankBadge';

export interface CompanyLeaderboard {
  score: number;
  company: Company;
}

export function CompanyTopList({
  items,
  ...props
}: CommonLeaderboardProps<CompanyLeaderboard[]>): ReactElement {
  const createRowMouseEnter = useCallback(
    (rankIndex: number) => (e: React.MouseEvent<HTMLLIElement>) => {
      const rankStyle = TOP_RANK_STYLES[rankIndex];
      if (!rankStyle) {
        return;
      }

      runIconPopAnimation(e.currentTarget, 'leaderboard-medal-wrapper');
      runSparkAnimation(
        e.currentTarget,
        '.leaderboard-medal-spark',
        rankStyle.glowColor,
        16,
      );
    },
    [],
  );

  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.company.name}
          index={i + 1}
          className={classNames(
            'group flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler',
            TOP_RANK_STYLES[i]?.hoverClass,
          )}
          onMouseEnter={TOP_RANK_STYLES[i] ? createRowMouseEnter(i) : undefined}
        >
          <TopRankBadge rankIndex={i} />
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
