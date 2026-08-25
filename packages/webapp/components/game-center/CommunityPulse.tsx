import type { ReactElement } from 'react';
import React from 'react';
import type { QuestCompletionStats } from '@dailydotdev/shared/src/graphql/leaderboard';
import type { UserLeaderboard } from '@dailydotdev/shared/src/components/cards/Leaderboard';
import {
  ProfileImageSize,
  ProfilePicture,
} from '@dailydotdev/shared/src/components/ProfilePicture';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { ProgressBar } from '@dailydotdev/shared/src/components/fields/ProgressBar';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';

const raceLength = 5;

type RaceProps = {
  title: string;
  entries: UserLeaderboard[];
  unit: string;
};

const Race = ({ title, entries, unit }: RaceProps): ReactElement => {
  const ranked = entries.slice(0, raceLength);
  // The bars are relative to the leader, so the field reads as a race rather
  // than as a set of unrelated numbers.
  const top = ranked[0]?.score ?? 0;

  return (
    <div className="flex flex-col gap-4 rounded-14 bg-background-subtle p-5">
      <Typography type={TypographyType.Subhead} bold>
        {title}
      </Typography>
      <div className="flex flex-col gap-4">
        {ranked.map((entry, index) => (
          <div key={entry.user.id} className="flex items-center gap-2">
            <Typography
              type={TypographyType.Subhead}
              color={TypographyColor.Tertiary}
              className="w-4 shrink-0 tabular-nums"
            >
              {index + 1}
            </Typography>
            <Tooltip content={`${entry.user.name} · ${entry.score} ${unit}`}>
              <a href={`/${entry.user.username}`} className="shrink-0">
                <ProfilePicture
                  user={entry.user}
                  size={ProfileImageSize.Small}
                  nativeLazyLoading
                />
              </a>
            </Tooltip>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Typography type={TypographyType.Subhead} className="truncate">
                  {entry.user.name}
                </Typography>
                <Typography
                  type={TypographyType.Subhead}
                  bold
                  className="shrink-0 tabular-nums"
                >
                  {formatDataTileValue(entry.score)}
                </Typography>
              </div>
              <ProgressBar
                percentage={top ? (entry.score / top) * 100 : 0}
                shouldShowBg
                className={{
                  wrapper: 'h-1 rounded-max',
                  bar: 'h-full rounded-max',
                  barColor: 'bg-accent-cabbage-default',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

type CommunityPulseProps = {
  stats: QuestCompletionStats | null;
  highestReputation: UserLeaderboard[];
  mostQuestsCompleted: UserLeaderboard[];
};

export const CommunityPulse = ({
  stats,
  highestReputation,
  mostQuestsCompleted,
}: CommunityPulseProps): ReactElement => (
  <div className="flex flex-col gap-2 rounded-20 border border-border-subtlest-tertiary p-2">
    <div className="grid gap-2 tablet:grid-cols-2">
      <Race
        title="Most badges"
        entries={highestReputation}
        unit="achievement points"
      />
      <Race title="Most quests" entries={mostQuestsCompleted} unit="quests" />
    </div>

    {stats && (
      <div className="flex items-baseline gap-1.5 px-2 pb-1">
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          quests completed all-time
        </Typography>
        <Typography type={TypographyType.Callout} bold className="tabular-nums">
          {formatDataTileValue(stats.totalCount)}
        </Typography>
      </div>
    )}
  </div>
);
