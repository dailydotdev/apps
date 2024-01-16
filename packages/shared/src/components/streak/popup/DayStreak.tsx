import React, { ReactElement } from 'react';
import ReadingStreakIcon from '../../icons/ReadingStreak';
import classed from '../../../lib/classed';
import TriangleArrowIcon from '../../icons/Arrow/Triangle';
import { IconSize } from '../../Icon';

export enum Streak {
  Completed = 'completed',
  Pending = 'pending',
  Upcoming = 'upcoming',
  Freeze = 'freeze',
}

interface DayStreakProps {
  streak: Streak;
  day: number;
  shouldShowArrow?: boolean;
}

const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const Circle = classed(
  'div',
  'size-7 rounded-full border border-theme-divider-tertiary',
);

export function DayStreak({
  streak,
  day,
  shouldShowArrow,
}: DayStreakProps): ReactElement {
  const renderIcon = () => {
    if (streak === Streak.Completed || streak === Streak.Pending) {
      return (
        <ReadingStreakIcon
          secondary={streak === Streak.Completed}
          size={IconSize.Medium}
        />
      );
    }

    return (
      <Circle
        className={streak === Streak.Freeze && 'bg-theme-label-disabled'}
      />
    );
  };

  const finalDay = day < 7 ? day : day % 7;

  return (
    <div className="relative flex flex-col items-center gap-1">
      {shouldShowArrow && (
        <TriangleArrowIcon
          className="absolute -top-4 text-theme-color-bacon"
          size={IconSize.XXSmall}
        />
      )}
      {renderIcon()}
      {dayInitial[finalDay]}
    </div>
  );
}
