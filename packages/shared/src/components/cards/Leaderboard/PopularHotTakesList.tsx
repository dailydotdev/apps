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
import { webappUrl } from '../../../lib/constants';
import { getHotTakesProfileUrl } from '../../../features/profile/components/hotTakes/common';
import { HotTakeShareControl } from '../../../features/profile/components/hotTakes/HotTakeShareButton';
import { Origin } from '../../../lib/log';
import { useHotTakeShareEnabled } from '../../../hooks/useHotTakeShareEnabled';

export type PopularHotTakes = {
  score: number;
  hotTake: Pick<HotTake, 'id' | 'title' | 'subtitle' | 'emoji'>;
  user: Pick<LoggedUser, 'username'>;
};

export function PopularHotTakesList({
  items,
  ...props
}: CommonLeaderboardProps<PopularHotTakes[]>): ReactElement {
  const isShareEnabled = useHotTakeShareEnabled();
  // The custom header must mirror the container's default heading markup so
  // flag-off (no header passed) and flag-on only differ by the share control.
  const header = isShareEnabled ? (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="font-bold typo-title3">{props.containerProps.title}</h3>
      <HotTakeShareControl
        link={`${webappUrl}users`}
        text="The most popular hot takes on daily.dev — developers' spiciest opinions, ranked."
        label="Share the hot takes leaderboard"
        origin={Origin.PopularHotTakes}
      />
    </div>
  ) : undefined;

  return (
    <LeaderboardList {...props} header={header}>
      {items?.map(({ hotTake, score, user }) => {
        return (
          <LeaderboardListItem
            key={hotTake.id}
            href={getHotTakesProfileUrl(user.username)}
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
