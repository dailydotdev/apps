import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ReadingStreakIcon, TriangleArrowIcon, EditIcon } from '../../icons';
import classed from '../../../lib/classed';
import { IconSize, iconSizeToClassName } from '../../Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { dateFormatInTimezone } from '../../../lib/timezones';
import { webappUrl } from '../../../lib/constants';
import { Tooltip } from '../../tooltip/Tooltip';

export enum Streak {
  Completed = 'completed',
  Pending = 'pending',
  Upcoming = 'upcoming',
  Freeze = 'freeze',
}

interface DayStreakProps {
  streak: Streak;
  date: Date;
  size?: IconSize;
  className?: string;
  shouldShowArrow?: boolean;
}

const Circle = classed(
  'div',
  'rounded-full border border-border-subtlest-tertiary',
);

export function DayStreak({
  streak,
  date,
  size = IconSize.Medium,
  className,
  shouldShowArrow,
}: DayStreakProps): ReactElement {
  const { user } = useAuthContext();
  const router = useRouter();

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

    const isStreakFreeze = streak === Streak.Freeze;

    return (
      <Circle
        className={classNames(
          className,
          iconSizeToClassName[size],
          isStreakFreeze &&
            'flex cursor-pointer items-center justify-center bg-text-disabled text-transparent laptop:hover:text-surface-secondary',
        )}
        onClick={() => {
          if (isStreakFreeze) {
            router.push(`${webappUrl}account/customization/streaks`);
          }
        }}
      >
        {isStreakFreeze && <EditIcon size={IconSize.XSmall} />}
      </Circle>
    );
  };

  return (
    <Tooltip
      visible={streak === Streak.Freeze}
      content="We auto-freeze streaks during the weekend, but you can still keep going if you want to"
      side="bottom"
      className="max-w-44 !p-2 text-center"
    >
      <div className="relative flex flex-col items-center gap-1">
        {shouldShowArrow && (
          <TriangleArrowIcon
            className="absolute -top-4 text-accent-bacon-default"
            size={IconSize.XXSmall}
          />
        )}
        {renderIcon()}
        {dateFormatInTimezone(date, 'iiiii', user.timezone)}
      </div>
    </Tooltip>
  );
}
