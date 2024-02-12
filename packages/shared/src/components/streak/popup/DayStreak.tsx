import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon, TriangleArrowIcon } from '../../icons';
import classed from '../../../lib/classed';
import { IconSize, iconSizeToClassName } from '../../Icon';
import { isNullOrUndefined } from '../../../lib/func';

export enum Streak {
  Completed = 'completed',
  Pending = 'pending',
  Upcoming = 'upcoming',
  Freeze = 'freeze',
}

interface DayStreakProps {
  streak: Streak;
  day?: number;
  size?: IconSize;
  className?: string;
  shouldShowArrow?: boolean;
}

const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const Circle = classed(
  'div',
  'rounded-full border border-theme-divider-tertiary',
);

export function DayStreak({
  streak,
  day,
  size = IconSize.Medium,
  className,
  shouldShowArrow,
}: DayStreakProps): ReactElement {
  const renderIcon = () => {
    if (streak === Streak.Completed || streak === Streak.Pending) {
      return (
        <ReadingStreakIcon
          secondary={streak === Streak.Completed}
          className={className}
          size={size}
        />
      );
    }

    return (
      <Circle
        className={classNames(
          className,
          iconSizeToClassName[size],
          streak === Streak.Freeze && 'bg-theme-label-disabled',
        )}
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
      {!isNullOrUndefined(day) ? dayInitial[finalDay] : null}
    </div>
  );
}
