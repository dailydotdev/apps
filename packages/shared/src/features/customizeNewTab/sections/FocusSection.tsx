import type { ReactElement } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import type {
  FocusSchedule,
  FocusScheduleWeekday,
  FocusScheduleWindow,
} from '../../../graphql/settings';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useDndContext } from '../../../contexts/DndContext';
import { useLogContext } from '../../../contexts/LogContext';
import { LogEvent, TargetType } from '../../../lib/log';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { SidebarSection } from '../components/SidebarSection';
import { TimeDropdown } from '../components/TimeDropdown';
import { defaultFocusSchedule, WEEKDAYS } from '../lib/focusSchedule';

const PAUSE_PRESETS_MS = [
  { id: '30m', label: '30 min', ms: 30 * 60_000 },
  { id: '1h', label: '1 hour', ms: 60 * 60_000 },
  { id: '2h', label: '2 hours', ms: 2 * 60 * 60_000 },
] as const;

const WEEKDAY_LABEL: Record<FocusScheduleWeekday, string> = {
  mon: 'M',
  tue: 'T',
  wed: 'W',
  thu: 'T',
  fri: 'F',
  sat: 'S',
  sun: 'S',
};

const DEFAULT_WINDOW: FocusScheduleWindow = {
  start: 9 * 60,
  end: 17 * 60,
  enabled: false,
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

const formatClock = (epochMs: number): string =>
  new Date(epochMs).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const getTomorrowMorning = (date: Date = new Date()): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(6, 0, 0, 0);
  return next;
};

// Re-render once a minute while a pause is active so the countdown stays
// fresh without busy-looping.
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

type PauseChipProps = {
  label: string;
  onClick: () => void;
};

const PauseChip = ({ label, onClick }: PauseChipProps): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-10 bg-surface-float px-3 py-1.5 text-text-primary transition-colors typo-footnote hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default"
  >
    {label}
  </button>
);

const ensureSchedule = (schedule: FocusSchedule | undefined): FocusSchedule =>
  schedule ?? defaultFocusSchedule();

const NATIVE_NEW_TAB_LINK = 'chrome://new-tab-page';

export const FocusSection = (): ReactElement => {
  const { flags, updateFlag } = useSettingsContext();
  const { logEvent } = useLogContext();
  const {
    dndSettings,
    isActive: isPaused,
    onDndSettings,
    setShowDnd,
  } = useDndContext();
  const schedule = ensureSchedule(flags?.focusSchedule);

  useTickEveryMinute(isPaused);

  const writeSchedule = (next: FocusSchedule) =>
    updateFlag('focusSchedule', next);

  // Pauses go through the existing DnD context (extension IndexedDB).
  // It owns the pre-React redirect plumbing in
  // `extension/src/newtab/index.tsx`, so a fresh new tab redirects to
  // the browser's native new tab without any flash. Resume clears the
  // same store via `onDndSettings(null)`.
  const setDndPause = useCallback(
    (expiration: Date) => {
      if (!onDndSettings) {
        return;
      }
      onDndSettings({ expiration, link: NATIVE_NEW_TAB_LINK });
    },
    [onDndSettings],
  );

  const handlePresetClick = (preset: (typeof PAUSE_PRESETS_MS)[number]) => {
    setDndPause(new Date(Date.now() + preset.ms));
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_now',
      extra: JSON.stringify({ preset: preset.id }),
    });
  };

  const handleUntilTomorrow = () => {
    setDndPause(getTomorrowMorning());
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_now',
      extra: JSON.stringify({ preset: 'until_tomorrow' }),
    });
  };

  const handleCustomPause = () => {
    // Hand off to the existing DnD modal — it owns the custom-duration
    // editor and writes to the same IDB key. Keeps a single source of
    // truth for pause configuration.
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_custom',
    });
    setShowDnd?.(true);
  };

  const handleResume = () => {
    // DndContext accepts `null` to clear at runtime; the strict signature
    // doesn't reflect that yet — match `DndBanner.tsx`'s call site.
    (onDndSettings as unknown as (s: null) => Promise<void>)?.(null);
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_pause_resume',
    });
  };

  const pauseExpiration =
    isPaused && dndSettings?.expiration
      ? new Date(dndSettings.expiration).getTime()
      : null;

  const setWindow = (
    day: FocusScheduleWeekday,
    update: Partial<FocusScheduleWindow>,
  ) => {
    const current = schedule.windows?.[day] ?? DEFAULT_WINDOW;
    writeSchedule({
      ...schedule,
      windows: {
        ...schedule.windows,
        [day]: { ...current, ...update },
      },
    });
    logEvent({
      event_name: LogEvent.ChangeSettings,
      target_type: TargetType.CustomizeNewTab,
      target_id: 'focus_schedule_window_set',
      extra: JSON.stringify({ day, ...update }),
    });
  };

  const toggleDay = (day: FocusScheduleWeekday) => {
    const current = schedule.windows?.[day] ?? DEFAULT_WINDOW;
    setWindow(day, { enabled: !current.enabled });
  };

  return (
    <>
      <SidebarSection title="Take a break">
        {isPaused ? (
          <div className="flex items-center justify-between gap-3 rounded-10 bg-surface-float px-3 py-2">
            <div className="flex min-w-0 flex-col">
              <Typography type={TypographyType.Footnote}>
                Pause active
              </Typography>
              {pauseExpiration && (
                <Typography
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                >
                  {formatRemaining(pauseExpiration - Date.now())}
                </Typography>
              )}
            </div>
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              onClick={handleResume}
            >
              Resume
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {PAUSE_PRESETS_MS.map((preset) => (
              <PauseChip
                key={preset.id}
                label={preset.label}
                onClick={() => handlePresetClick(preset)}
              />
            ))}
            <PauseChip label="Until tomorrow" onClick={handleUntilTomorrow} />
            <PauseChip label="Custom…" onClick={handleCustomPause} />
          </div>
        )}
      </SidebarSection>

      <SidebarSection
        title="Active hours"
        description="Pick the times when Focus mode kicks in automatically. Days you select redirect this tab to your browser's native new tab during the chosen window."
      >
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map((day) => {
            const window = schedule.windows?.[day] ?? DEFAULT_WINDOW;
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                aria-pressed={!!window.enabled}
                aria-label={day}
                className={classNames(
                  'h-9 flex-1 basis-9 rounded-10 text-center font-bold transition-colors typo-caption1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cabbage-default',
                  window.enabled
                    ? 'bg-text-primary text-background-default'
                    : 'bg-surface-float text-text-tertiary hover:text-text-primary',
                )}
              >
                {WEEKDAY_LABEL[day]}
              </button>
            );
          })}
        </div>

        {WEEKDAYS.some((d) => schedule.windows?.[d]?.enabled) && (
          <div className="mt-3 flex flex-col gap-2">
            {WEEKDAYS.filter((d) => schedule.windows?.[d]?.enabled).map(
              (day) => {
                const window = schedule.windows?.[day] ?? DEFAULT_WINDOW;
                return (
                  <div
                    key={day}
                    className="flex items-center gap-2 rounded-10 bg-surface-float px-3 py-2"
                  >
                    <span className="w-8 font-bold uppercase text-text-primary typo-caption1">
                      {day}
                    </span>
                    <TimeDropdown
                      ariaLabel={`${day} start`}
                      value={window.start}
                      onChange={(start) => setWindow(day, { start })}
                    />
                    <span
                      aria-hidden
                      className="text-text-tertiary typo-caption2"
                    >
                      –
                    </span>
                    <TimeDropdown
                      ariaLabel={`${day} end`}
                      value={window.end}
                      onChange={(end) => setWindow(day, { end })}
                    />
                  </div>
                );
              },
            )}
          </div>
        )}

        {pauseExpiration && (
          <Typography
            type={TypographyType.Caption2}
            color={TypographyColor.Tertiary}
          >
            Resumes at {formatClock(pauseExpiration)}
          </Typography>
        )}
      </SidebarSection>
    </>
  );
};
