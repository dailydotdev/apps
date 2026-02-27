import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  addDays,
  format,
  isSameDay,
  subDays,
} from 'date-fns';
import { ReadingStreakIcon } from '../../icons';
import type { ReadingDay } from '../../../graphql/users';
import { isWeekend as isWeekendDay } from '../../../lib/date';

interface StreakMonthCalendarProps {
  history?: ReadingDay[];
  weekStart?: number;
  timezone?: string;
  currentStreak?: number;
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
  anchorDate: Date,
  weekStart: number | undefined,
  timezone: string | undefined,
): Set<string> {
  const result = new Set<string>();
  let remaining = streakCount;
  let cursor = anchorDate;

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
  currentStreak,
  streakOverride,
  trailing,
}: StreakMonthCalendarProps): ReactElement {
  const baseToday = useMemo(() => new Date(), []);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const effectiveStreak = streakOverride ?? currentStreak;
  const hasPositiveStreak = (effectiveStreak ?? 0) > 0;
  const activeStreak = Math.max(streakOverride ?? currentStreak ?? 1, 1);
  const initialStreakRef = useRef(activeStreak);
  const streakDelta = activeStreak - initialStreakRef.current;
  const today = useMemo(() => addDays(baseToday, streakDelta), [baseToday, streakDelta]);
  const todayAbsoluteIndex = activeStreak - 1;
  const startRowIndex = Math.max(0, Math.floor(todayAbsoluteIndex / 10) - 1);
  const startAbsoluteIndex = startRowIndex * 10;

  const days = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => {
        const absoluteIndex = startAbsoluteIndex + index;
        return subDays(today, todayAbsoluteIndex - absoluteIndex);
      }),
    [startAbsoluteIndex, today, todayAbsoluteIndex],
  );

  const readDaysSet = useMemo(() => {
    if (streakOverride !== undefined) {
      return generateDummyReadDays(streakOverride, today, weekStart, timezone);
    }

    if (currentStreak !== undefined) {
      return generateDummyReadDays(currentStreak, today, weekStart, timezone);
    }

    if (!history) {
      return new Set<string>();
    }

    return new Set(
      history
        .filter((d) => d.reads > 0)
        .map((d) => new Date(d.date).toDateString()),
    );
  }, [currentStreak, history, streakOverride, today, weekStart, timezone]);

  const todayLabel = formatDayLabel(today, today, isWeekendDay(today, weekStart, timezone));
  const displayLabel = hoveredDay
    ? formatDayLabel(hoveredDay, today, isWeekendDay(hoveredDay, weekStart, timezone))
    : todayLabel;
  const isHoveredWeekend =
    !!hoveredDay && isWeekendDay(hoveredDay, weekStart, timezone);

  const [visible, setVisible] = useState(true);
  const pendingLabel = useRef(displayLabel);
  const [renderedLabel, setRenderedLabel] = useState(displayLabel);
  const [windowDays, setWindowDays] = useState(days);
  const [elevatorTrackDays, setElevatorTrackDays] = useState<Date[] | null>(null);
  const [isElevatorAnimating, setIsElevatorAnimating] = useState(false);
  const [trackOffsetPx, setTrackOffsetPx] = useState(0);
  const [windowHeightPx, setWindowHeightPx] = useState<number | null>(null);
  const previousStartRowIndex = useRef(startRowIndex);
  const gridContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!gridContainerRef.current || elevatorTrackDays) {
      return;
    }

    setWindowHeightPx(gridContainerRef.current.getBoundingClientRect().height);
  }, [elevatorTrackDays, windowDays]);

  useEffect(() => {
    if (previousStartRowIndex.current === startRowIndex) {
      setWindowDays(days);
      previousStartRowIndex.current = startRowIndex;
      return;
    }

    const rowShift = startRowIndex - previousStartRowIndex.current;
    const isSingleRowShift = Math.abs(rowShift) === 1;
    const gridElement = gridContainerRef.current;

    if (!isSingleRowShift || !gridElement) {
      setWindowDays(days);
      previousStartRowIndex.current = startRowIndex;
      return;
    }

    const { height: currentWindowHeight } = gridElement.getBoundingClientRect();
    const styles = window.getComputedStyle(gridElement);
    const rowGap = parseFloat(styles.rowGap || styles.gap || '0') || 0;
    const rowStep = (currentWindowHeight + rowGap) / 3;

    if (!Number.isFinite(rowStep) || rowStep <= 0) {
      setWindowDays(days);
      previousStartRowIndex.current = startRowIndex;
      return;
    }

    const forwardIncomingRow = days.slice(20, 30);
    const backwardIncomingRow = days.slice(0, 10);
    const nextTrackDays =
      rowShift > 0
        ? [...windowDays, ...forwardIncomingRow]
        : [...backwardIncomingRow, ...windowDays];
    const initialOffset = rowShift > 0 ? 0 : -rowStep;
    const targetOffset = rowShift > 0 ? -rowStep : 0;

    setWindowHeightPx(currentWindowHeight);
    setElevatorTrackDays(nextTrackDays);
    setTrackOffsetPx(initialOffset);
    setIsElevatorAnimating(false);

    const animationFrame = requestAnimationFrame(() => {
      setIsElevatorAnimating(true);
      setTrackOffsetPx(targetOffset);
    });
    const animationTimer = setTimeout(() => {
      setWindowDays(days);
      setElevatorTrackDays(null);
      setTrackOffsetPx(0);
      setIsElevatorAnimating(false);
      previousStartRowIndex.current = startRowIndex;
    }, 240);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(animationTimer);
    };
  }, [days, startRowIndex, windowDays]);

  const renderDayCircle = (
    day: Date,
    index: number,
    keyPrefix: string,
    isInteractive: boolean,
  ): ReactElement => {
    const isToday = isSameDay(day, today);
    const isFreeze = isWeekendDay(day, weekStart, timezone);
    const isRead =
      !isFreeze &&
      readDaysSet.has(day.toDateString()) &&
      (!isToday || hasPositiveStreak);

    return (
      <div
        key={`${keyPrefix}-${day.toISOString()}-${index}`}
        className={classNames(
          'relative size-5 place-self-center cursor-pointer rounded-full border border-border-subtlest-tertiary bg-surface-subtle',
          'flex items-center justify-center',
          isToday && 'border-white',
          isFreeze &&
            'bg-surface-float text-border-subtlest-tertiary bg-[repeating-linear-gradient(135deg,currentColor_0_2px,transparent_2px_5px)]',
        )}
        onMouseEnter={isInteractive ? () => setHoveredDay(day) : undefined}
        onMouseLeave={isInteractive ? () => setHoveredDay(null) : undefined}
        onClick={isInteractive ? () => setHoveredDay(day) : undefined}
        role="button"
        tabIndex={0}
      >
        {isToday && !isFreeze && (
          <span className="pointer-events-none absolute inset-0 rounded-full border border-white/70 animate-streak-day-pop" />
        )}
        {isRead && (
          <ReadingStreakIcon
            secondary
            className="size-4 text-accent-bacon-default"
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="mb-1 mt-1 flex items-center justify-between gap-1">
        <span
          className={classNames(
            'block min-w-0 max-w-[12.5rem] flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-bold text-text-tertiary typo-subhead transition-opacity duration-100',
            visible ? 'opacity-100' : 'opacity-0',
          )}
        >
          {renderedLabel}
        </span>
        {!isHoveredWeekend && trailing}
      </div>
      <div
        className={classNames(
          'relative',
          elevatorTrackDays ? 'overflow-hidden' : 'overflow-visible',
        )}
        style={windowHeightPx ? { height: `${windowHeightPx}px` } : undefined}
      >
        {elevatorTrackDays ? (
          <div
            className={classNames(
              'pointer-events-none',
              isElevatorAnimating && 'transition-transform duration-200 ease-out',
            )}
            style={{ transform: `translateY(${trackOffsetPx}px)` }}
          >
            <div className="grid w-full grid-cols-10 grid-rows-4 gap-2.5">
              {elevatorTrackDays.map((day, index) =>
                renderDayCircle(day, index, 'elevator', false),
              )}
            </div>
          </div>
        ) : (
          <div ref={gridContainerRef} className="grid w-full grid-cols-10 grid-rows-3 gap-2.5">
            {windowDays.map((day, index) =>
              renderDayCircle(day, index, 'window', true),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
