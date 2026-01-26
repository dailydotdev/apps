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
      {items?.map(({ hotTake, score, user }) => {
        return (
          <LeaderboardListItem
            key={hotTake.id}
            href={user.permalink}
            index={score}
            className="flex w-full flex-row items-center rounded-8 px-2 py-2 hover:bg-accent-pepper-subtler"
          >
            <span className="min-w-8 pl-1">{hotTake.emoji}</span>
            <div className="flex min-h-10 min-w-0 flex-1 flex-col justify-center gap-1 px-2">
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Primary}
                bold
              >
                {hotTake.title}
              </Typography>
              {hotTake.subtitle && (
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                >
                  {hotTake.subtitle}
                </Typography>
              )}
            </div>
          </LeaderboardListItem>
        );
      })}
    </LeaderboardList>
  );
}
