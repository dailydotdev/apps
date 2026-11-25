import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../../components/icons/ReadingStreak';
import { IconSize } from '../../components/Icon';
import { ReputationUserBadge } from '../../components/ReputationUserBadge';
import { getQuestLevelProgress } from '../../components/quest/QuestLevelProgressCircle';
import type { QuestLevel } from '../../graphql/quests';
import { LeaderboardType } from '../../graphql/leaderboard';
import { formatLeaderboardScore } from './boards';

interface ScoreProps {
  className?: string;
  /** The rank card's size: a step up in text and icon. */
  large?: boolean;
}

/** Reputation reads as the profile's badge: the bolt and the number. */
export const LeaderboardReputation = ({
  value,
  className,
  large = false,
}: ScoreProps & { value: number }): ReactElement => (
  <ReputationUserBadge
    className={classNames(large && '!typo-callout', className)}
    iconProps={large ? { size: IconSize.Small } : undefined}
    user={{ reputation: value }}
  />
);

/** Streak days read as the header's streak counter: the flame and the days. */
export const LeaderboardStreak = ({
  days,
  className,
  large = false,
}: ScoreProps & { days: number }): ReactElement => (
  <span
    className={classNames(
      'flex items-center font-bold text-text-primary',
      large ? 'typo-callout' : 'typo-footnote',
      className,
    )}
  >
    {/* The flame fills its box while the reputation bolt sits inside one,
        so the flame is drawn smaller in the bolt's slot to match it. */}
    <span
      className={classNames(
        'flex shrink-0 items-center justify-center',
        large ? 'size-6' : 'size-5',
      )}
    >
      <ReadingStreakIcon
        secondary
        className={large ? '!size-4' : '!size-3.5'}
      />
    </span>
    {formatLeaderboardScore(days)}
  </span>
);

const RING_SIZE = 16;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** The level ring in its colors, small enough for a row. */
const LevelRing = ({ progress }: { progress: number }): ReactElement => (
  <svg
    width={RING_SIZE}
    height={RING_SIZE}
    viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
    fill="none"
    className="shrink-0 -rotate-90"
    aria-hidden
  >
    <circle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_RADIUS}
      strokeWidth={RING_STROKE}
      className="stroke-border-subtlest-tertiary"
    />
    <circle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_RADIUS}
      strokeWidth={RING_STROKE}
      strokeLinecap="round"
      strokeDasharray={RING_CIRCUMFERENCE}
      strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
      className="stroke-accent-avocado-default"
    />
  </svg>
);

/** Highest level reads as the level, with a small ring for its progress. */
export const LeaderboardLevel = ({
  level,
  label = false,
  className,
}: {
  level: QuestLevel;
  /** Says "Level 120" where the board's title isn't beside it. */
  label?: boolean;
  className?: string;
}): ReactElement => (
  <span className={classNames('flex items-center gap-1.5', className)}>
    <LevelRing progress={getQuestLevelProgress(level)} />
    {label ? `Level ${level.level}` : level.level}
  </span>
);

/** A board's score the way its own surface shows it, or the plain number. */
export const LeaderboardScoreValue = ({
  type,
  score,
  level,
  className,
}: {
  type: LeaderboardType;
  score: number;
  level?: QuestLevel | null;
  className?: string;
}): ReactNode => {
  if (type === LeaderboardType.HighestReputation) {
    return <LeaderboardReputation value={score} className={className} />;
  }
  if (type === LeaderboardType.HighestLevel && level) {
    return <LeaderboardLevel level={level} className={className} />;
  }
  if (type === LeaderboardType.LongestStreak) {
    return <LeaderboardStreak days={score} className={className} />;
  }
  return formatLeaderboardScore(score);
};
