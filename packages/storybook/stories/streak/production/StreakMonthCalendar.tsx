import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { StreakMonthCalendar as ProductionStreakMonthCalendar } from '@dailydotdev/shared/src/components/streak/popup/StreakMonthCalendar';
import { HotIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  freezeTooltipCopy,
  Streak,
} from '@dailydotdev/shared/src/components/streak/popup/DayStreak';
import type { UserStreak } from '@dailydotdev/shared/src/graphql/users';
import {
  getStreak,
  useReadingStreak30Days,
  useStreakFreezeDates,
} from '@dailydotdev/shared/src/hooks/streaks/useStreakDays';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import {
  DEFAULT_TIMEZONE,
  isSameDayInTimezone,
} from '@dailydotdev/shared/src/lib/timezones';
import { useConditionalFeature } from '../../../mock/hooks/useConditionalFeature';
import {
  getGtaViLabel,
  GtaViDisc,
  GtaViTooltip,
  gtaViFreezeDayFeature,
  isGtaViReleaseDay,
} from '../gtaViParts';

/*
 * Storybook stands this in for production's StreakMonthCalendar (see the
 * resolver in .storybook/main.ts). With gta_vi_freeze_day off it renders
 * production's component untouched. With it on, it renders production's
 * calendar code plus the VI branch: the change a production PR would make.
 */

const DAYS = 30;
const LEADING_DAYS = 4;

const GtaViStreakMonthCalendar = ({
  streak,
}: {
  streak?: UserStreak;
}): ReactElement => {
  const { user } = useAuthContext();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const history = useReadingStreak30Days();
  const freezeDates = useStreakFreezeDates();

  const days = useMemo(() => {
    const today = new Date();
    const start = subDays(today, LEADING_DAYS);
    return Array.from({ length: DAYS }, (_, index) => {
      const date = addDays(start, index);
      return {
        date,
        state: getStreak({
          value: date,
          today,
          history,
          startOfWeek: streak?.weekStart,
          timezone,
          freezeDates,
        }),
        isToday: isSameDayInTimezone(date, today, timezone),
      };
    });
  }, [history, streak?.weekStart, timezone, freezeDates]);

  return (
    <div className="grid grid-cols-10 gap-x-2 gap-y-2.5">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        if (isGtaViReleaseDay(date, timezone)) {
          return (
            <GtaViTooltip
              key={date.getTime()}
              today={new Date()}
              timezone={timezone}
            >
              <button
                type="button"
                aria-label={getGtaViLabel(date, timezone, isRead)}
                className="place-self-center rounded-full"
              >
                <GtaViDisc
                  className="-m-px size-[1.125rem]"
                  isToday={isToday}
                />
              </button>
            </GtaViTooltip>
          );
        }
        const isFreeze = state === Streak.Freeze || state === Streak.UsedFreeze;
        let stateClass = 'border-text-quaternary';
        if (isRead) {
          stateClass = 'border-transparent bg-accent-bacon-default';
        } else if (isToday) {
          stateClass = 'border-transparent';
        } else if (isFreeze) {
          stateClass =
            'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-text-quaternary';
        }
        const cell = (
          <div
            key={date.getTime()}
            className={classNames(
              'relative flex size-4 items-center justify-center place-self-center rounded-full border',
              stateClass,
            )}
          >
            {isRead && (
              <HotIcon
                secondary
                size={IconSize.XXSmall}
                className="text-white"
              />
            )}
            {isToday && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
              />
            )}
          </div>
        );
        const tooltipContent = freezeTooltipCopy[state];
        if (!tooltipContent) {
          return cell;
        }
        return (
          <Tooltip
            key={date.getTime()}
            content={tooltipContent}
            side="bottom"
            className="max-w-44 !p-2 text-center"
          >
            {cell}
          </Tooltip>
        );
      })}
    </div>
  );
};

export const StreakMonthCalendar = ({
  streak,
}: {
  streak?: UserStreak;
}): ReactElement => {
  const { value: isGtaViEnabled } = useConditionalFeature({
    feature: gtaViFreezeDayFeature,
  });

  if (!isGtaViEnabled) {
    return <ProductionStreakMonthCalendar streak={streak} />;
  }

  return <GtaViStreakMonthCalendar streak={streak} />;
};
