import type { ReactElement } from 'react';
import React from 'react';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import type { LoggedUser } from '../../../lib/user';
import { indexToEmoji } from './common';

export interface UserLeaderboard {
  score: number;
  user: LoggedUser;
}

export function UserTopList({
  items,
  concatScore = true,
  ...props
}: CommonLeaderboardProps<UserLeaderboard[]>): ReactElement {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.user.id}
          index={item.score}
          href={item.user.permalink}
          concatScore={concatScore}
        >
          <span className="min-w-8 pl-1">{indexToEmoji(i)}</span>
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
