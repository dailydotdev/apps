import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  subDays,
} from 'date-fns';
import type { ReadingDay } from '../../../graphql/users';
import { isWeekend as isWeekendDay } from '../../../lib/date';

interface StreakMonthCalendarProps {
  history?: ReadingDay[];
  weekStart?: number;
  timezone?: string;
  streakOverride?: number;
  trailing?: React.ReactNode;
}

function formatDayLabel(
  day: Date,
  today: Date,
  isWeekend: boolean,
): string {
  const isToday = isSameDay(day, today);
  const datePart = format(day, 'MMMM d, yyyy');
  const label = isToday ? `Today, ${datePart}` : format(day, 'EEEE, MMMM d, yyyy');

  if (isWeekend) {
    return `${label} (weekend)`;
  }

  return label;
}

function generateDummyReadDays(
  streakCount: number,
  weekStart: number | undefined,
  timezone: string | undefined,
): Set<string> {
  const result = new Set<string>();
  const now = new Date();
  let remaining = streakCount;
  let cursor = now;

  while (remaining > 0) {
    if (!isWeekendDay(cursor, weekStart, timezone)) {
      result.add(cursor.toDateString());
      remaining -= 1;
    }
    cursor = subDays(cursor, 1);
  }

  return result;
}

export function StreakMonthCalendar({
  history,
  weekStart,
  timezone,
  streakOverride,
  trailing,
}: StreakMonthCalendarProps): ReactElement {
  const today = useMemo(() => new Date(), []);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const { days, monthLabel } = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return {
      days: allDays,
      monthLabel: format(today, 'MMMM yyyy'),
    };
  }, [today]);

  const readDaysSet = useMemo(() => {
    if (streakOverride !== undefined) {
      return generateDummyReadDays(streakOverride, weekStart, timezone);
    }

    if (!history) {
      return new Set<string>();
    }

    return new Set(
      history
        .filter((d) => d.reads > 0)
        .map((d) => new Date(d.date).toDateString()),
    );
  }, [history, streakOverride, weekStart, timezone]);

  const todayLabel = formatDayLabel(today, today, isWeekendDay(today, weekStart, timezone));
  const displayLabel = hoveredDay
    ? formatDayLabel(hoveredDay, today, isWeekendDay(hoveredDay, weekStart, timezone))
    : todayLabel;
  const isHoveredWeekend =
    !!hoveredDay && isWeekendDay(hoveredDay, weekStart, timezone);

  const [visible, setVisible] = useState(true);
  const pendingLabel = useRef(displayLabel);
  const [renderedLabel, setRenderedLabel] = useState(displayLabel);

  useEffect(() => {
    if (displayLabel === renderedLabel) {
      setVisible(true);
      return;
    }

    if (!hoveredDay) {
      setRenderedLabel(displayLabel);
      setVisible(true);
      return;
    }

    pendingLabel.current = displayLabel;
    setVisible(false);

    const timer = setTimeout(() => {
      setRenderedLabel(pendingLabel.current);
      setVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [displayLabel, renderedLabel, hoveredDay]);

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 mt-1 flex items-center justify-between">
        <span
          className={classNames(
            'block min-w-0 flex-1 truncate font-bold text-text-tertiary typo-subhead transition-opacity duration-100',
            visible ? 'opacity-100' : 'opacity-0',
          )}
        >
          {renderedLabel}
        </span>
        {!isHoveredWeekend && trailing}
      </div>
      <div className="grid w-full grid-cols-[repeat(11,1fr)] grid-rows-3 gap-2.5">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isFreeze = isWeekendDay(day, weekStart, timezone);
          const isRead = !isFreeze && readDaysSet.has(day.toDateString());

          return (
            <div
              key={day.toDateString()}
              className={classNames(
                'aspect-square w-full cursor-pointer rounded-full border border-border-subtlest-tertiary bg-transparent',
                'flex items-center justify-center',
                isToday && 'animate-streak-day-pop',
                isToday && 'border-white',
                isFreeze &&
                  'bg-surface-float text-border-subtlest-tertiary bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_5px)]',
              )}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => setHoveredDay(day)}
              role="button"
              tabIndex={0}
            >
              {isRead && (
                <span className="aspect-square w-[42%] min-w-2.5 max-w-4 rounded-full bg-accent-bacon-default" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
