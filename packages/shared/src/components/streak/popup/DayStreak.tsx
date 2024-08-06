import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon, TriangleArrowIcon, EditIcon } from '../../icons';
import classed from '../../../lib/classed';
import { IconSize, iconSizeToClassName } from '../../Icon';
import { isNullOrUndefined } from '../../../lib/func';
import { SimpleTooltip } from '../../tooltips';

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
  onClick?: () => void;
}

const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const Circle = classed(
  'div',
  'rounded-full border border-border-subtlest-tertiary',
);

export function DayStreak({
  streak,
  day,
  size = IconSize.Medium,
  className,
  shouldShowArrow,
  onClick,
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
          streak === Streak.Freeze &&
            'flex cursor-pointer items-center justify-center bg-text-disabled text-transparent laptop:hover:text-surface-secondary',
        )}
        onClick={() => {
          if (streak === Streak.Freeze && onClick) {
            onClick();
          }
        }}
      >
        {streak === Streak.Freeze && <EditIcon size={IconSize.XSmall} />}
      </Circle>
    );
  };

  const finalDay = day < 7 ? day : day % 7;

  return (
    <SimpleTooltip
      show={streak === Streak.Freeze}
      content="We auto-freeze streaks during the weekend, but you can still keep going if you want to"
      placement="bottom"
      container={{
        className: 'max-w-44 text-center',
        paddingClassName: 'p-2',
      }}
    >
      <div className="relative flex flex-col items-center gap-1">
        {shouldShowArrow && (
          <TriangleArrowIcon
            className="absolute -top-4 text-accent-bacon-default"
            size={IconSize.XXSmall}
          />
        )}
        {renderIcon()}
        {!isNullOrUndefined(day) ? dayInitial[finalDay] : null}
      </div>
    </SimpleTooltip>
  );
}
