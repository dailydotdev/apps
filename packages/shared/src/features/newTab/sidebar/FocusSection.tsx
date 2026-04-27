import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { Switch } from '../../../components/fields/Switch';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import { useDndContext } from '../../../contexts/DndContext';
import { isExtension } from '../../../lib/func';
import { SidebarSection } from '../../customizeNewTab/components/SidebarSection';
import { TimeDropdown } from '../../customizeNewTab/components/TimeDropdown';
import {
  WEEKDAYS,
  isValidTimeString,
  useFocusSchedule,
  type FocusWindow,
  type Weekday,
} from '../store/focusSchedule.store';

// Five durations cover everything mainstream focus apps offer (iOS Focus,
// macOS DnD, Forest, Freedom). Anything beyond an evening becomes "until
// tomorrow"; anything more granular than 30m is overkill for a feed pause.
const PAUSE_PRESETS_MS: Array<{ id: string; label: string; ms: number }> = [
  { id: '30m', label: '30 min', ms: 30 * 60_000 },
  { id: '1h', label: '1 hour', ms: 60 * 60_000 },
  { id: '2h', label: '2 hours', ms: 2 * 60 * 60_000 },
];
const DEFAULT_NEW_TAB_LINK = 'chrome://new-tab-page';

// Re-render once a minute while a pause is active so the "28 min left"
// countdown stays fresh without busy-looping.
const useTickEveryMinute = (active: boolean): void => {
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const interval = window.setInterval(() => forceTick((n) => n + 1), 60_000);
    return () => window.clearInterval(interval);
  }, [active]);
};

const formatRemaining = (msLeft: number): string => {
  const totalMinutes = Math.max(1, Math.round(msLeft / 60_000));
  if (totalMinutes < 60) {
    return `${totalMinutes} min left`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours} hr left`;
  }
  return `${hours}h ${mins}m left`;
};

const getTomorrowMorning = (date: Date = new Date()): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(6, 0, 0, 0);
  return next;
};

interface PauseChipProps {
  label: string;
  onClick: () => void;
}

const PauseChip = ({ label, onClick }: PauseChipProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className={classNames(
      'rounded-10 bg-surface-float px-3 py-1.5 text-text-primary transition-colors typo-footnote',
      'hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
    )}
  >
    {label}
  </button>
);

const formatDaysSummary = (days: Set<Weekday>): string => {
  if (days.size === 0) {
    return 'No days yet';
  }
  if (days.size === 7) {
    return 'every day';
  }
  const weekdays = [1, 2, 3, 4, 5];
  const weekend = [0, 6];
  const arr = [...days].sort();
  if (
    arr.length === weekdays.length &&
    arr.every((d) => weekdays.includes(d))
  ) {
    return 'weekdays';
  }
  if (arr.length === weekend.length && arr.every((d) => weekend.includes(d))) {
    return 'weekends';
  }
  return arr
    .map((d) => WEEKDAYS.find((w) => w.value === d)?.short ?? '')
    .join(', ');
};

const formatTime12h = (hhmm: string): string => {
  if (!isValidTimeString(hhmm)) {
    return hhmm;
  }
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'h:mm a');
};

// Convert an array of stored per-day windows into the simpler shape this UI
// assumes: one shared time range + a set of days. Picks the most common
// (start, end) tuple as the canonical range so a returning user with a normal
// 9-5 schedule sees what they remember setting.
const summariseWindows = (
  windows: FocusWindow[],
): { days: Set<Weekday>; start: string; end: string } => {
  if (windows.length === 0) {
    return { days: new Set(), start: '09:00', end: '17:00' };
  }
  const counts = new Map<string, number>();
  windows.forEach((win) => {
    const key = `${win.start}-${win.end}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const [start, end] = top.split('-');
  return {
    days: new Set(windows.map((win) => win.weekday)),
    start,
    end,
  };
};

interface ScheduleEditorProps {
  windows: FocusWindow[];
  onUpdate: (next: FocusWindow[]) => void;
}

// Single shared time range applied to every selected weekday. Power users
// who need different hours per day can wait for an "advanced" follow-up;
// research (iOS Focus / macOS DnD) shows >90% of focus schedules are a
// single recurring range.
const ScheduleEditor = ({
  windows,
  onUpdate,
}: ScheduleEditorProps): ReactElement => {
  const initial = useMemo(() => summariseWindows(windows), [windows]);
  const [days, setDays] = useState<Set<Weekday>>(initial.days);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);

  useEffect(() => {
    setDays(initial.days);
    setStart(initial.start);
    setEnd(initial.end);
  }, [initial]);

  const commit = (
    nextDays: Set<Weekday>,
    nextStart: string,
    nextEnd: string,
  ) => {
    if (!isValidTimeString(nextStart) || !isValidTimeString(nextEnd)) {
      return;
    }
    const ordered = [...nextDays].sort((a, b) => a - b);
    onUpdate(
      ordered.map((weekday) => ({
        weekday,
        start: nextStart,
        end: nextEnd,
      })),
    );
  };

  const toggleDay = (weekday: Weekday) => {
    const next = new Set(days);
    if (next.has(weekday)) {
      next.delete(weekday);
    } else {
      next.add(weekday);
    }
    setDays(next);
    commit(next, start, end);
  };

  const handleStart = (value: string) => {
    setStart(value);
    commit(days, value, end);
  };

  const handleEnd = (value: string) => {
    setEnd(value);
    commit(days, start, value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {WEEKDAYS.map((day) => {
          const selected = days.has(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              aria-pressed={selected}
              aria-label={day.long}
              className={classNames(
                'h-9 flex-1 basis-9 rounded-10 text-center font-bold transition-colors typo-caption1',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                selected
                  ? 'bg-text-primary text-background-default'
                  : 'bg-surface-float text-text-tertiary hover:text-text-primary',
              )}
            >
              {day.short[0]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            From
          </Typography>
          <TimeDropdown
            value={start}
            onChange={handleStart}
            ariaLabel="Start time"
          />
        </div>
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="pb-2.5"
        >
          to
        </Typography>
        <div className="flex min-w-0 flex-col gap-1">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            Until
          </Typography>
          <TimeDropdown value={end} onChange={handleEnd} ariaLabel="End time" />
        </div>
      </div>

      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Tertiary}
        className="break-words"
      >
        Focus on {formatDaysSummary(days)}, {formatTime12h(start)} –{' '}
        {formatTime12h(end)}
      </Typography>
    </div>
  );
};

interface ActivePauseRowProps {
  pauseUntil: number;
  onResume: () => void;
}

// Inline-only pause status. The big "you're paused" UI lives in the global
// purple banner at the top of the page; the sidebar gets a single quiet
// row so it doesn't dominate the panel while a pause is running.
const ActivePauseRow = ({
  pauseUntil,
  onResume,
}: ActivePauseRowProps): ReactElement => {
  const msLeft = Math.max(0, pauseUntil - Date.now());
  const untilLabel = format(new Date(pauseUntil), 'h:mm a');
  return (
    <div className="flex items-center justify-between gap-3 rounded-10 bg-surface-float px-3 py-2">
      <div className="flex min-w-0 flex-col">
        <Typography type={TypographyType.Footnote}>
          Paused until {untilLabel}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {formatRemaining(msLeft)}
        </Typography>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        onClick={onResume}
      >
        Resume
      </Button>
    </div>
  );
};

const SCHEDULE_TOGGLE_ID = 'focus-schedule-toggle';

/**
 * Two stacked sub-blocks, ordered for the most common Focus interaction:
 *
 *   1) Take a break — instant pause for 30m / 1h / 2h / Until tomorrow /
 *      Custom. While paused the inline row shows the resume time and a
 *      Resume button; the loud "you're paused" UI lives in the top-of-page
 *      purple banner so the sidebar stays quiet.
 *   2) Active hours — a single Switch that, when on, limits Focus takeover to
 *      the days and hours below. Off means the feed stays visible unless a
 *      live focus session is running. Seeding 9-5 weekdays the first time the
 *      switch flips on saves the user from staring at an empty grid.
 */
export const FocusSection = (): ReactElement => {
  const { logEvent } = useLogContext();
  const {
    schedule,
    setSchedule,
    setEnabled,
    setWindowsMode,
    pauseFor,
    pauseUntilTomorrow,
  } = useFocusSchedule();
  const { setShowDnd, onDndSettings, dndSettings } = useDndContext();

  const isPaused =
    schedule.pauseUntil !== null && schedule.pauseUntil > Date.now();
  useTickEveryMinute(isPaused);

  // Keep the legacy 'feed_during' value migrated forward whenever the user
  // touches the schedule. The simplified UI only exposes the inverse.
  useEffect(() => {
    if (schedule.enabled && schedule.windowsMode !== 'focus_during') {
      setWindowsMode('focus_during');
    }
  }, [schedule.enabled, schedule.windowsMode, setWindowsMode]);

  const handlePauseFor = useCallback(
    (durationMs: number, label: string) => {
      const expiration = new Date(Date.now() + durationMs);
      logEvent({
        event_name: LogEvent.Click,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_pause_now',
        extra: JSON.stringify({ preset: label, duration_ms: durationMs }),
      });
      pauseFor(durationMs);
      if (isExtension && onDndSettings) {
        onDndSettings({
          expiration,
          link: dndSettings?.link || DEFAULT_NEW_TAB_LINK,
        }).catch(() => undefined);
      }
    },
    [dndSettings?.link, logEvent, onDndSettings, pauseFor],
  );

  const handleUntilTomorrow = useCallback(() => {
    const expiration = getTomorrowMorning();
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_now',
      extra: JSON.stringify({ preset: 'until_tomorrow' }),
    });
    pauseUntilTomorrow();
    if (isExtension && onDndSettings) {
      onDndSettings({
        expiration,
        link: dndSettings?.link || DEFAULT_NEW_TAB_LINK,
      }).catch(() => undefined);
    }
  }, [dndSettings?.link, logEvent, onDndSettings, pauseUntilTomorrow]);

  const handleCustomPause = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_custom',
    });
    setShowDnd?.(true);
  }, [logEvent, setShowDnd]);

  const handleResume = useCallback(() => {
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_resume',
    });
    pauseFor(null);
    onDndSettings?.(null).catch(() => undefined);
  }, [logEvent, onDndSettings, pauseFor]);

  const handleScheduleToggle = useCallback(() => {
    const next = !schedule.enabled;
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_schedule_toggle',
      extra: JSON.stringify({ enabled: next }),
    });
    if (next && schedule.windows.length === 0) {
      // First time turning the schedule on: seed weekdays 9-5 so the editor
      // isn't an empty grid the user has to figure out from scratch.
      setSchedule({
        ...schedule,
        enabled: true,
        windowsMode: 'focus_during',
        windows: [1, 2, 3, 4, 5].map((weekday) => ({
          weekday: weekday as Weekday,
          start: '09:00',
          end: '17:00',
        })),
      });
      return;
    }
    setEnabled(next);
  }, [logEvent, schedule, setEnabled, setSchedule]);

  const handleWindowsUpdate = useCallback(
    (nextWindows: FocusWindow[]) => {
      logEvent({
        event_name: LogEvent.ChangeSettings,
        target_type: TargetType.CustomizeNewTab,
        target_id: 'focus_schedule_window_set',
        extra: JSON.stringify({ count: nextWindows.length }),
      });
      setSchedule({
        ...schedule,
        windowsMode: 'focus_during',
        // If they cleared every day, fall back to "always on" so Focus
        // doesn't silently end up off forever.
        enabled: nextWindows.length > 0 ? schedule.enabled : false,
        windows: nextWindows,
      });
    },
    [logEvent, schedule, setSchedule],
  );

  return (
    <SidebarSection title="Focus">
      <div className="flex flex-col gap-2">
        <Typography type={TypographyType.Footnote} bold>
          Take a break
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="break-words"
        >
          Temporarily open your browser&apos;s default new tab instead of
          daily.dev.
        </Typography>

        {isPaused ? (
          <ActivePauseRow
            pauseUntil={schedule.pauseUntil ?? 0}
            onResume={handleResume}
          />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {PAUSE_PRESETS_MS.map((preset) => (
              <PauseChip
                key={preset.id}
                label={preset.label}
                onClick={() => handlePauseFor(preset.ms, preset.id)}
              />
            ))}
            <PauseChip label="Until tomorrow" onClick={handleUntilTomorrow} />
            {isExtension ? (
              <PauseChip label="Custom…" onClick={handleCustomPause} />
            ) : null}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col border-t border-border-subtlest-tertiary pt-4">
        <div className="flex items-center justify-between gap-3">
          {/* Switch wraps an <input type="checkbox"> internally; the
              jsx-a11y rule can't follow the indirection so we disable it. */}
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label
            htmlFor={SCHEDULE_TOGGLE_ID}
            className="flex min-w-0 flex-col gap-1"
          >
            <Typography type={TypographyType.Footnote} bold>
              Active hours
            </Typography>
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Tertiary}
              className="break-words"
            >
              Recurring hours when new tabs stay out of the way.
            </Typography>
          </label>
          <Switch
            inputId={SCHEDULE_TOGGLE_ID}
            name="focus-schedule"
            checked={schedule.enabled}
            onToggle={handleScheduleToggle}
            compact
          />
        </div>
        {/* CSS grid trick: animate the row height between 0fr and 1fr so the
            editor "falls down" smoothly without us measuring its height.
            Visibility is delayed on collapse so screen readers don't see the
            content while it's animating away. */}
        <div
          className={classNames(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            schedule.enabled ? 'mt-3 grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div
            className={classNames(
              'min-h-0 overflow-hidden',
              schedule.enabled ? 'visible' : 'invisible',
            )}
          >
            <ScheduleEditor
              windows={schedule.windows}
              onUpdate={handleWindowsUpdate}
            />
          </div>
        </div>
      </div>
    </SidebarSection>
  );
};
