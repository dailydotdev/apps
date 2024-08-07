import React, { ReactElement } from 'react';
import { Keyword, Tag } from '../../../graphql/keywords';
import { LeaderboardList, LeaderboardListProps } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { getTagPageLink } from '../../../lib';
import { Source } from '../../../graphql/sources';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';
import { LoggedUser } from '../../../lib/user';

export interface CommonLeaderboardProps<T extends Iterable<unknown>>
  extends Omit<LeaderboardListProps, 'children'> {
  items: T;
}

export const TagTopList = ({
  items,
  ...props
}: CommonLeaderboardProps<Tag[] | Keyword[]>): ReactElement => {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.value}
          index={i + 1}
          href={getTagPageLink(item.value)}
          className="py-1.5 pr-2"
        >
          <p className="pl-4">{item.value}</p>
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
};

export const SourceTopList = ({
  items,
  ...props
}: CommonLeaderboardProps<Source[]>): ReactElement => {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem key={item.id} index={i + 1} href={item.permalink}>
          <UserHighlight
            {...item}
            userType={UserType.Source}
            className={{
              wrapper: 'min-w-0 flex-shrink !p-2',
              image: '!h-8 !w-8',
              textWrapper: '!ml-2',
              name: '!typo-caption1',
              handle: '!typo-caption2',
            }}
            allowSubscribe={false}
          />
        </LeaderboardListItem>
      ))}
    </LeaderboardList>
  );
};

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

export const UserTopList = ({
  items,
  ...props
}: CommonLeaderboardProps<UserLeaderboard[]>): ReactElement => {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => (
        <LeaderboardListItem
          key={item.user.id}
          index={item.score}
          href={item.user.permalink}
        >
          <span className="pl-1">{indexToEmoji(i)}</span>
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
};
