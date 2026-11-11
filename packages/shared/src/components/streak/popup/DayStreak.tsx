import type { ReactElement } from 'react';
import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ReadingStreakIcon, TriangleArrowIcon, EditIcon } from '../../icons';
import classed from '../../../lib/classed';
import { IconSize, iconSizeToClassName } from '../../Icon';
import { useAuthContext } from '../../../contexts/AuthContext';
import { dateFormatInTimezone, DEFAULT_TIMEZONE } from '../../../lib/timezones';
import { webappUrl } from '../../../lib/constants';
import { Tooltip } from '../../tooltip/Tooltip';
import {
  getGtaViLabel,
  GtaViDisc,
  GtaViTooltip,
  isGtaViReleaseDay,
  useIsGtaViDayEnabled,
} from './GtaViDay';

export enum Streak {
  Completed = 'completed',
  Pending = 'pending',
  Upcoming = 'upcoming',
  Freeze = 'freeze',
  UsedFreeze = 'used_freeze',
}

export const freezeTooltipCopy: Partial<Record<Streak, string>> = {
  [Streak.Freeze]:
    'We auto-freeze streaks during the weekend, but you can still keep going if you want to',
  [Streak.UsedFreeze]: 'A streak freeze was used this day',
};

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
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const isGtaViDayEnabled = useIsGtaViDayEnabled(
    isGtaViReleaseDay(date, timezone),
  );
  const [tooltipLayer, setTooltipLayer] = useState<Element>();
  const gtaViTriggerRef = useCallback((node: HTMLButtonElement | null) => {
    setTooltipLayer(node?.closest('[data-tippy-root]') ?? undefined);
  }, []);

  if (isGtaViDayEnabled) {
    return (
      <GtaViTooltip timezone={timezone} appendTo={tooltipLayer}>
        <button
          ref={gtaViTriggerRef}
          type="button"
          aria-label={getGtaViLabel(
            date,
            timezone,
            streak === Streak.Completed,
          )}
          className="relative flex flex-col items-center gap-1"
        >
          {shouldShowArrow && (
            <TriangleArrowIcon
              className="absolute -top-4 text-accent-bacon-default"
              size={IconSize.XXSmall}
            />
          )}
          <GtaViDisc className={iconSizeToClassName[size]} />
          {dateFormatInTimezone(date, 'iiiii', timezone)}
        </button>
      </GtaViTooltip>
    );
  }

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

    const isStreakFreeze =
      streak === Streak.Freeze || streak === Streak.UsedFreeze;

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

  const tooltipContent = freezeTooltipCopy[streak];

  return (
    <Tooltip
      visible={!!tooltipContent}
      content={tooltipContent}
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
        {dateFormatInTimezone(date, 'iiiii', timezone)}
      </div>
    </Tooltip>
  );
}
