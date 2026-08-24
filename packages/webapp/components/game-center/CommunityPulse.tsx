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
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  MedalBadgeIcon,
  ReputationLightningIcon,
} from '@dailydotdev/shared/src/components/icons';
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';

const raceLength = 5;

type RaceProps = {
  title: string;
  icon: ReactElement;
  entries: UserLeaderboard[];
  unit: string;
};

const Race = ({ title, icon, entries, unit }: RaceProps): ReactElement => {
  const ranked = entries.slice(0, raceLength);
  // The bars are relative to the leader, so the field reads as a race rather
  // than as a set of unrelated numbers.
  const top = ranked[0]?.score ?? 0;

  return (
    <div className="flex flex-col gap-3 rounded-14 bg-background-subtle p-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <Typography type={TypographyType.Subhead} bold>
          {title}
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
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
            <div className="flex min-w-0 flex-1 flex-col gap-1">
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
              <div className="h-1.5 rounded-max bg-background-default">
                <div
                  className="h-full rounded-max bg-accent-cabbage-default"
                  style={{
                    width: top ? `${(entry.score / top) * 100}%` : '0%',
                  }}
                />
              </div>
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
    {stats && (
      <div className="px-2 pt-2">
        <Typography type={TypographyType.Title2} bold className="tabular-nums">
          {formatDataTileValue(stats.totalCount)}
        </Typography>
        <Typography
          type={TypographyType.Subhead}
          color={TypographyColor.Tertiary}
        >
          quests completed all-time
        </Typography>
      </div>
    )}
    <div className="grid gap-2 tablet:grid-cols-2">
      <Race
        title="Top reputation"
        icon={
          <ReputationLightningIcon
            secondary
            size={IconSize.Size16}
            className="text-accent-cabbage-default"
          />
        }
        entries={highestReputation}
        unit="reputation"
      />
      <Race
        title="Most quests"
        icon={
          <MedalBadgeIcon
            size={IconSize.Size16}
            className="text-accent-cabbage-default"
          />
        }
        entries={mostQuestsCompleted}
        unit="quests"
      />
    </div>
  </div>
);
