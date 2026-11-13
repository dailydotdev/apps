import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ProgressBar } from '../fields/ProgressBar';
import type { StreakGoalProgress as StreakGoalProgressData } from '../../lib/streakGoal';
import { getStreakGoalCopy } from '../../lib/streakGoal';

interface StreakGoalProgressProps {
  progress: StreakGoalProgressData | null;
  className?: string;
}

// "{current}/{goal} to your goal" with a thin bar, under the streak count.
// Renders nothing without a goal in progress (see useStreakGoal).
export const StreakGoalProgress = ({
  progress,
  className,
}: StreakGoalProgressProps): ReactElement | null => {
  if (!progress) {
    return null;
  }

  return (
    <div
      className={classNames('flex flex-col gap-1', className)}
      data-testid="streak-goal-progress"
    >
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="tabular-nums"
      >
        {getStreakGoalCopy(progress)}
      </Typography>
      <ProgressBar
        percentage={progress.ratio * 100}
        shouldShowBg
        className={{
          wrapper: 'h-1 rounded-4',
          bar: 'h-full rounded-4',
          barColor: 'bg-accent-bacon-default',
        }}
      />
    </div>
  );
};
