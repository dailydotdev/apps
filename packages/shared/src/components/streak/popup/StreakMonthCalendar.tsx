import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { subDays } from 'date-fns';
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

// A compact 30-day reading calendar (10 × 3 grid of dots): read days carry the
// filled flame, weekends use a dashed diagonal pattern (auto-frozen), today is
// outlined, and untouched days are empty dotted circles. Inspired by the
// month-calendar from the streak-progression design exploration, rebuilt on our
// real history data and existing day-state logic.
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
    return Array.from({ length: DAYS }, (_, index) => {
      const date = subDays(today, DAYS - 1 - index);
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
    <div className="grid grid-cols-10 gap-1.5">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        const isFreeze = state === Streak.Freeze;
        return (
          <div
            key={date.getTime()}
            className={classNames(
              'relative flex size-5 items-center justify-center place-self-center rounded-full border border-border-subtlest-tertiary',
              isToday && '!border-text-primary',
              isFreeze &&
                'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-border-subtlest-tertiary',
            )}
          >
            {isRead && (
              <ReadingStreakIcon
                secondary
                className="size-4 text-accent-bacon-default"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
