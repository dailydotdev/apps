import type { ReactElement } from 'react';
import React from 'react';
import type { Source } from '../../../graphql/sources';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import { UserHighlight, UserType } from '../../widgets/PostUsersHighlights';

export function SourceTopList({
  items,
  ...props
}: CommonLeaderboardProps<Source[]>): ReactElement {
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
}
