import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import classNames from 'classnames';
import { addDays, subDays } from 'date-fns';
import { HotIcon } from '../../icons';
import { IconSize } from '../../Icon';
import { Tooltip } from '../../tooltip/Tooltip';
import { freezeTooltipCopy, Streak } from './DayStreak';
import type { UserStreak } from '../../../graphql/users';
import {
  getStreak,
  useReadingStreak30Days,
  useStreakFreezeDates,
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
        // A consumed streak freeze shares the weekend-freeze dashed pattern —
        // same mapping as DayStreak, which draws both states identically.
        const isFreeze = state === Streak.Freeze || state === Streak.UsedFreeze;
        // Every cell is the same size-4 circle: read days fill pink, today gets
        // a ring, weekends take the dashed pattern, the rest stay outlines.
        //
        // Outlines use `text-quaternary` (64% of salt, defined per theme) rather
        // than
        // `border-subtlest-tertiary` (20% of an already-subtle border): the
        // untouched and weekend days are DATA, not chrome, and at the old value
        // they were nearly invisible in both themes. Same colour family the
        // quest list uses for its secondary text.
        let stateClass = 'border-text-quaternary';
        if (isRead) {
          // The disc is ours, so the flame on top can be white — matching the
          // rail's StreakBadge. The icon's own filled art can't: it is a single
          // evenodd path with a hardcoded pink fill whose flame is a CUTOUT, so
          // the page shows through it and no text colour can reach it.
          stateClass = 'border-transparent bg-accent-bacon-default';
        } else if (isToday) {
          // Today's ring is a separate overlay (below), so today drops its own
          // border too.
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
              // 12px flame in the 16px cell — the same glyph-to-disc ratio the
              // rail badge uses (20px in 26px).
              <HotIcon
                secondary
                size={IconSize.XXSmall}
                className="text-white"
              />
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
        // Freeze days keep the explanatory tooltip the old streak popup had
        // (weekend auto-freeze / consumed freeze).
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
