import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';

type QuestLevelProgressShape = {
  xpInLevel: number;
  xpToNextLevel: number;
};

interface QuestLevelProgressCircleProps {
  level: number;
  progress: number;
  className?: string;
  levelClassName?: string;
  dataRewardTarget?: string;
}

export const QUEST_LEVEL_PROGRESS_SIZE = 40;
const QUEST_LEVEL_PROGRESS_STROKE = 4;
const QUEST_LEVEL_PROGRESS_RADIUS =
  (QUEST_LEVEL_PROGRESS_SIZE - QUEST_LEVEL_PROGRESS_STROKE) / 2;
const QUEST_LEVEL_PROGRESS_CIRCUMFERENCE =
  2 * Math.PI * QUEST_LEVEL_PROGRESS_RADIUS;

export const getQuestLevelProgress = ({
  xpInLevel,
  xpToNextLevel,
}: QuestLevelProgressShape): number => {
  const totalForLevel = xpInLevel + xpToNextLevel;

  if (!totalForLevel) {
    return 0;
  }

  return Math.min(100, (xpInLevel / totalForLevel) * 100);
};

export const QuestLevelProgressCircle = ({
  level,
  progress,
  className,
  levelClassName,
  dataRewardTarget,
}: QuestLevelProgressCircleProps): ReactElement => {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <span
      className={classNames(
        'relative inline-flex size-10 items-center justify-center',
        className,
      )}
    >
      <svg
        width={QUEST_LEVEL_PROGRESS_SIZE}
        height={QUEST_LEVEL_PROGRESS_SIZE}
        viewBox={`0 0 ${QUEST_LEVEL_PROGRESS_SIZE} ${QUEST_LEVEL_PROGRESS_SIZE}`}
        fill="none"
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={QUEST_LEVEL_PROGRESS_SIZE / 2}
          cy={QUEST_LEVEL_PROGRESS_SIZE / 2}
          r={QUEST_LEVEL_PROGRESS_RADIUS}
          strokeWidth={QUEST_LEVEL_PROGRESS_STROKE}
          className="stroke-border-subtlest-tertiary"
        />
        <circle
          cx={QUEST_LEVEL_PROGRESS_SIZE / 2}
          cy={QUEST_LEVEL_PROGRESS_SIZE / 2}
          r={QUEST_LEVEL_PROGRESS_RADIUS}
          strokeWidth={QUEST_LEVEL_PROGRESS_STROKE}
          strokeLinecap="round"
          strokeDasharray={QUEST_LEVEL_PROGRESS_CIRCUMFERENCE}
          strokeDashoffset={
            QUEST_LEVEL_PROGRESS_CIRCUMFERENCE * (1 - safeProgress / 100)
          }
          className="stroke-accent-cabbage-default transition-[stroke-dashoffset] duration-100 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        />
      </svg>
      <span
        data-reward-target={dataRewardTarget}
        className={classNames(
          'absolute font-bold text-text-primary typo-caption1',
          levelClassName,
        )}
      >
        {level}
      </span>
    </span>
  );
};
