import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
} from 'date-fns';
import type { ReadingDay } from '../../../graphql/users';
import { isWeekend as isWeekendDay } from '../../../lib/date';

interface StreakMonthCalendarProps {
  history?: ReadingDay[];
  weekStart?: number;
  timezone?: string;
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

export function StreakMonthCalendar({
  history,
  weekStart,
  timezone,
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
    if (!history) {
      return new Set<string>();
    }

    return new Set(
      history
        .filter((d) => d.reads > 0)
        .map((d) => new Date(d.date).toDateString()),
    );
  }, [history]);

  const displayLabel = hoveredDay
    ? formatDayLabel(hoveredDay, today, isWeekendDay(hoveredDay, weekStart, timezone))
    : monthLabel;

  const [visible, setVisible] = useState(true);
  const pendingLabel = useRef(displayLabel);
  const [renderedLabel, setRenderedLabel] = useState(displayLabel);

  useEffect(() => {
    if (displayLabel === renderedLabel) {
      return;
    }

    pendingLabel.current = displayLabel;
    setVisible(false);

    const timer = setTimeout(() => {
      setRenderedLabel(pendingLabel.current);
      setVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [displayLabel, renderedLabel]);

  return (
    <div className="flex flex-col gap-1">
      <span
        className={classNames(
          'mb-1 mt-1 font-bold text-text-tertiary typo-caption1 transition-opacity duration-100',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {renderedLabel}
      </span>
      <div className="grid w-full grid-cols-[repeat(16,1fr)] grid-rows-3 gap-2.5">
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const isFuture = day > today;
          const isRead = readDaysSet.has(day.toDateString());
          const isFreeze = isWeekendDay(day, weekStart, timezone);
          const isPastMissed = !isFuture && !isToday && !isRead && !isFreeze;

          return (
            <div
              key={day.toDateString()}
              className={classNames(
                'aspect-square w-full cursor-pointer rounded-full',
                isRead && 'bg-accent-bacon-default',
                isToday && !isRead && 'animate-streak-day-pop border border-accent-bacon-default',
                isFreeze && !isRead && 'bg-surface-float',
                isPastMissed && 'bg-border-subtlest-tertiary',
                isFuture && 'bg-surface-float',
              )}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => setHoveredDay(day)}
              role="button"
              tabIndex={0}
            />
          );
        })}
      </div>
    </div>
  );
}
