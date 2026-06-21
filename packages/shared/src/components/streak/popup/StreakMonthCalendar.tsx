import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { ReadingStreakIcon } from '../../icons';
import { Streak } from './DayStreak';
import type { UserStreak } from '../../../graphql/users';
import {
  getStreak,
  useReadingHistory,
} from '../../../hooks/streaks/useStreakDays';
import { useAuthContext } from '../../../contexts/AuthContext';
import { DEFAULT_TIMEZONE, isSameDayInTimezone } from '../../../lib/timezones';

const DAYS = 30;
// How many days before today to start the grid, so today sits early in the
// first row and the rest of the period reads ahead (matches the streak design).
const LEADING_DAYS = 4;

// A compact 30-day reading calendar (10 × 3 grid of dots): read days carry the
// filled flame on a brand-pink dot, weekends use a dashed diagonal pattern
// (auto-frozen), today is ringed, and untouched days are empty dotted circles.
// Rebuilt on our real history + existing day-state logic.
export const StreakMonthCalendar = ({
  streak,
}: {
  streak?: UserStreak;
}): ReactElement => {
  const { user } = useAuthContext();
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const history = useReadingHistory();

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
        }),
        isToday: isSameDayInTimezone(date, today, timezone),
      };
    });
  }, [history, streak?.weekStart, timezone]);

  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        const isFreeze = state === Streak.Freeze;
        return (
          <div
            key={date.getTime()}
            className={classNames(
              'relative flex size-5 items-center justify-center place-self-center rounded-full border',
              isRead
                ? 'border-transparent bg-accent-bacon-default'
                : 'border-border-subtlest-tertiary',
              isFreeze &&
                'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-border-subtlest-tertiary',
              isToday &&
                'ring-1 ring-text-primary ring-offset-1 ring-offset-background-default',
            )}
          >
            {isRead && (
              <ReadingStreakIcon
                secondary
                className="size-3.5 text-background-default"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
