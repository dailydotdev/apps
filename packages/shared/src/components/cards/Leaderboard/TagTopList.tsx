import React, { ReactElement } from 'react';

import { Keyword, Tag } from '../../../graphql/keywords';
import { getTagPageLink } from '../../../lib';
import { CommonLeaderboardProps, LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';

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
