import React, { ReactElement } from 'react';
import { CommonLeaderboardProps, LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight } from '../../widgets/PostUsersHighlights';
import { LoggedUser } from '../../../lib/user';

export interface UserLeaderboard {
  score: number;
  user: LoggedUser;
}

const indexToEmoji = (index: number): string => {
  switch (index) {
    case 0:
      return '🏆';
    case 1:
      return '🥈';
    case 2:
      return '🥉';
    default:
      return '';
  }
};

export function UserTopList({
  items,
  ...props
}: CommonLeaderboardProps<UserLeaderboard[]>): ReactElement {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.user.id}
          index={item.score}
          href={item.user.permalink}
        >
          <span className="pl-1 min-w-8">{indexToEmoji(i)}</span>
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
