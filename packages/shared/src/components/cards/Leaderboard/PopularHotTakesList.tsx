import type { ReactElement } from 'react';
import React from 'react';
import type { CommonLeaderboardProps } from './LeaderboardList';
import { LeaderboardList } from './LeaderboardList';
import { LeaderboardListItem } from './LeaderboardListItem';
import type { HotTake } from '../../../graphql/user/userHotTake';
import type { LoggedUser } from '../../../lib/user';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { indexToEmoji } from './common';

export type PopularHotTakes = {
  score: number;
  hotTake: Pick<HotTake, 'id' | 'title' | 'subtitle' | 'emoji'>;
  user: Pick<LoggedUser, 'permalink'>;
};

export function PopularHotTakesList({
  items,
  ...props
}: CommonLeaderboardProps<PopularHotTakes[]>): ReactElement {
  return (
    <LeaderboardList {...props}>
      {items?.map((item, i) => {
        return (
          <LeaderboardListItem
            key={item.hotTake.id}
            href={item.user.permalink}
            index={item.score}
            className="flex w-full flex-row items-center rounded-8 px-2 hover:bg-accent-pepper-subtler"
          >
            <span className="min-w-8 pl-1">{indexToEmoji(i)}</span>
            <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-14 bg-overlay-quaternary-cabbage">
              <span className="text-2xl">{item.hotTake.emoji}</span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 p-2">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                {item.hotTake.title}
              </Typography>
              {item.hotTake.subtitle && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {item.hotTake.subtitle}
                </Typography>
              )}
            </div>
          </LeaderboardListItem>
        );
      })}
    </LeaderboardList>
  );
}
