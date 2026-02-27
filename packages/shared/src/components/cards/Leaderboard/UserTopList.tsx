import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import type { LoggedUser } from '../../../lib/user';
import { runIconPopAnimation, runSparkAnimation, TOP_RANK_STYLES } from './common';
import { TopRankBadge } from './TopRankBadge';

export interface UserLeaderboard {
  score: number;
  user: LoggedUser;
}

export function UserTopList({
  items,
  concatScore = true,
  ...props
}: CommonLeaderboardProps<UserLeaderboard[]>): ReactElement {
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
          key={item.user.id}
          index={item.score}
          concatScore={concatScore}
          className={classNames(
            'group flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler',
            TOP_RANK_STYLES[i]?.hoverClass,
          )}
          onMouseEnter={TOP_RANK_STYLES[i] ? createRowMouseEnter(i) : undefined}
        >
          <TopRankBadge rankIndex={i} />
          <UserHighlight
            {...item.user}
            showReputation
            className={{
              wrapper: 'min-w-0 flex-shrink !p-2',
              image: '!size-8',
              textWrapper: '!ml-2',
              name: '!typo-caption1',
              reputation: '!typo-caption1',
              handle: '!typo-caption2',
            }}
            allowSubscribe={false}
          />
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
}
