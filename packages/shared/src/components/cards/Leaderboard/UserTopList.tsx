import type { ReactElement } from 'react';
import React, { useCallback } from 'react';
import classNames from 'classnames';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import type { LoggedUser } from '../../../lib/user';
import type { QuestLevel } from '../../../graphql/quests';
import {
  runIconPopAnimation,
  runSparkAnimation,
  TOP_RANK_STYLES,
} from './common';
import { TopRankBadge } from './TopRankBadge';
import {
  getQuestLevelProgress,
  QuestLevelProgressCircle,
} from '../../quest/QuestLevelProgressCircle';

export interface UserLeaderboard {
  score: number;
  user: LoggedUser;
  level?: QuestLevel | null;
}

export function UserTopList({
  items,
  concatScore = true,
  showLevel = false,
  ...props
}: CommonLeaderboardProps<UserLeaderboard[]> & {
  showLevel?: boolean;
}): ReactElement {
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
          {showLevel && item.level && (
            <QuestLevelProgressCircle
              level={item.level.level}
              progress={getQuestLevelProgress(item.level)}
              className="mr-2 shrink-0"
            />
          )}
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
