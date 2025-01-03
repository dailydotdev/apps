import type { ReactElement } from 'react';
import React from 'react';
import type { Keyword, Tag } from '../../../graphql/keywords';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { getTagPageLink } from '../../../lib';

export function TagTopList({
  items,
  ...props
}: CommonLeaderboardProps<Tag[] | Keyword[]>): ReactElement {
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
}
