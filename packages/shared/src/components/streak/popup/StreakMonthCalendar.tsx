import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { ReadingStreakIcon } from '../../icons';
import { IconSize } from '../../Icon';
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
    <div className="grid grid-cols-10 gap-x-2 gap-y-2.5">
      {days.map(({ date, state, isToday }) => {
        const isRead = state === Streak.Completed;
        const isFreeze = state === Streak.Freeze;
        // Every cell is the same size-4 circle. A read day is the solid pink
        // disc (the secondary flame glyph fills its whole box), so its border is
        // dropped and the glyph is sized to the cell — otherwise the icon's
        // default XSmall (20px) overflows the 16px cell and the read dot reads
        // visibly bigger than the others. Today gets a ring, weekends the
        // dashed pattern.
        let stateClass = 'border-border-subtlest-tertiary';
        if (isToday || isRead) {
          // Today's ring is a separate overlay (below), so today drops its own
          // border too.
          stateClass = 'border-transparent';
        } else if (isFreeze) {
          stateClass =
            'bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-border-subtlest-tertiary';
        }
        return (
          <div
            key={date.getTime()}
            className={classNames(
              'relative flex size-4 items-center justify-center place-self-center rounded-full border',
              stateClass,
            )}
          >
            {isRead && (
              // `size` (not a w/h className) controls the real glyph size — a
              // className loses to the Icon's size class. Size16 matches the
              // size-4 cell so the disc is the same diameter as every other dot.
              <ReadingStreakIcon secondary size={IconSize.Size16} />
            )}
            {isToday && (
              // "Today" ring as a TOP overlay (z-1) so it stays visible over the
              // read-day flame disc. A 1px white border hugging the OUTSIDE of
              // the dot (no inset, no offset gap) so the flame fills the circle
              // and the ring is a clean thin border around it.
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-1 rounded-full ring-1 ring-text-primary"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
