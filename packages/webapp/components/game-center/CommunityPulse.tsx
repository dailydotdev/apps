import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
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
import { formatDataTileValue } from '@dailydotdev/shared/src/lib/numberFormat';

const railLength = 10;

// Gold, silver, bronze for the first three; everyone else rides plain.
const podiumRing = [
  'ring-accent-cheese-default',
  'ring-accent-salt-subtle',
  'ring-accent-bun-default',
];

const podiumBadge = [
  'bg-accent-cheese-default',
  'bg-accent-salt-subtle',
  'bg-accent-bun-default',
];

type CounterProps = {
  value: string;
  label: string;
  caption?: string;
};

const Counter = ({ value, label, caption }: CounterProps): ReactElement => (
  <div className="flex min-w-0 flex-col">
    <Typography type={TypographyType.Title2} bold className="tabular-nums">
      {value}
    </Typography>
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      className="truncate"
    >
      {label}
    </Typography>
    {caption && (
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Quaternary}
        className="truncate"
      >
        {caption}
      </Typography>
    )}
  </div>
);

type RailProps = {
  label: string;
  items: UserLeaderboard[];
  unit: string;
};

const Rail = ({ label, items, unit }: RailProps): ReactElement => (
  <div className="flex items-center gap-3">
    <Typography
      type={TypographyType.Caption1}
      color={TypographyColor.Tertiary}
      bold
      className="w-28 shrink-0"
    >
      {label}
    </Typography>
    <div className="-my-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1">
      {items.slice(0, railLength).map((entry, index) => (
        <Tooltip
          key={entry.user.id}
          content={`#${index + 1} · ${entry.user.name} · ${formatDataTileValue(
            entry.score,
          )} ${unit}`}
        >
          <span className="relative shrink-0">
            <ProfilePicture
              user={entry.user}
              size={ProfileImageSize.Large}
              className={classNames(
                'rounded-max',
                index < 3 && `ring-2 ${podiumRing[index]}`,
              )}
              nativeLazyLoading
            />
            {index < 3 && (
              <span
                className={classNames(
                  'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-max px-1 font-black text-black typo-caption2',
                  podiumBadge[index],
                )}
              >
                {index + 1}
              </span>
            )}
          </span>
        </Tooltip>
      ))}
    </div>
  </div>
);

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
  <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    {stats && (
      <div className="grid gap-4 tablet:grid-cols-3">
        <Counter
          value={formatDataTileValue(stats.totalCount)}
          label="quests completed all-time"
        />
        {/* The count leads and the quest name captions it — the other way
            round the name is what gets truncated, and it is the useful half. */}
        {stats.allTimeLeader && (
          <Counter
            value={stats.allTimeLeader.count.toLocaleString()}
            label="most completed, all time"
            caption={stats.allTimeLeader.questName}
          />
        )}
        {stats.weeklyLeader && (
          <Counter
            value={stats.weeklyLeader.count.toLocaleString()}
            label="most completed this week"
            caption={stats.weeklyLeader.questName}
          />
        )}
      </div>
    )}

    {(highestReputation.length > 0 || mostQuestsCompleted.length > 0) && (
      <div
        className={classNames(
          'flex flex-col gap-3',
          stats && 'border-t border-border-subtlest-tertiary pt-4',
        )}
      >
        {highestReputation.length > 0 && (
          <Rail
            label="Top reputation"
            items={highestReputation}
            unit="reputation"
          />
        )}
        {mostQuestsCompleted.length > 0 && (
          <Rail label="Most quests" items={mostQuestsCompleted} unit="quests" />
        )}
      </div>
    )}
  </div>
);
