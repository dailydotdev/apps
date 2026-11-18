import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { addDays, format, parseISO } from 'date-fns';
import { useAuthContext } from '../../contexts/AuthContext';
import { useReadingStreak } from '../../hooks/streaks/useReadingStreak';
import {
  formatStreakPauseDate,
  getStreakPauseDays,
  hasStreakPauseStarted,
  isStreakDayPaused,
  toStreakLocalDate,
  useStreakPause,
  useUserStreakPause,
} from '../../hooks/streaks/useStreakPause';
import { usePrompt } from '../../hooks/usePrompt';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import {
  MAX_STREAK_PAUSE_DAYS,
  MAX_STREAK_PAUSE_LEAD_DAYS,
  MAX_STREAK_PAUSES_PER_YEAR,
  MIN_STREAK_FOR_PAUSE,
} from '../../graphql/streakPause';
import { Button, ButtonVariant } from '../buttons/Button';
import styles from '../fields/dateTimeInput.module.css';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

const LOCAL_DATE_FORMAT = 'yyyy-MM-dd';

const addLocalDays = (date: string, days: number): string =>
  format(addDays(parseISO(date), days), LOCAL_DATE_FORMAT);

const dateInputClassName = classNames(
  styles.dateTimeInput,
  'rounded-10 border border-border-subtlest-tertiary bg-transparent px-3 py-2 text-text-primary typo-body disabled:text-text-disabled',
);

export const streakPauseHelperCopy = `Pause for up to ${MAX_STREAK_PAUSE_DAYS} days, twice a year. Your streak needs to be at least ${MIN_STREAK_FOR_PAUSE} days.`;

// "Pause my streak" on the gamification settings: schedule a pause (vacation
// mode) or cancel the running/scheduled one. Renders null unless reading
// streaks are on.
export const StreakPauseSettings = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { streak, isStreaksEnabled } = useReadingStreak();
  const pause = useUserStreakPause(streak);
  const { schedule, cancel, isScheduling, isCancelling } = useStreakPause();
  const { showPrompt } = usePrompt();
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const timezone = user?.timezone ?? DEFAULT_TIMEZONE;
  const today = useMemo(
    () => toStreakLocalDate(new Date(), timezone),
    [timezone],
  );
  const tomorrow = addLocalDays(today, 1);
  const maxStart = addLocalDays(today, MAX_STREAK_PAUSE_LEAD_DAYS);

  if (!isStreaksEnabled || !streak) {
    return null;
  }

  const canPause = streak.current >= MIN_STREAK_FOR_PAUSE;
  const maxEnd = start ? addLocalDays(start, MAX_STREAK_PAUSE_DAYS - 1) : '';
  const isValidRange =
    !!start &&
    !!end &&
    start >= tomorrow &&
    start <= maxStart &&
    end >= start &&
    getStreakPauseDays({ start, end }) <= MAX_STREAK_PAUSE_DAYS;

  const onStartChange = (value: string) => {
    setStart(value);

    if (
      end &&
      (end < value || end > addLocalDays(value, MAX_STREAK_PAUSE_DAYS - 1))
    ) {
      setEnd('');
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidRange) {
      return;
    }

    if (await schedule({ start, end })) {
      setStart('');
      setEnd('');
    }
  };

  const onCancel = async () => {
    if (
      pause &&
      hasStreakPauseStarted(pause, timezone) &&
      !(await showPrompt({
        title: 'End your streak pause?',
        description: `Your streak counts again from today. This pause still counts as one of your ${MAX_STREAK_PAUSES_PER_YEAR} pauses this year.`,
        okButton: { title: 'End pause' },
        cancelButton: { title: 'Keep pause' },
      }))
    ) {
      return;
    }

    await cancel();
  };

  const renderBody = () => {
    if (pause) {
      const isRunning = isStreakDayPaused(new Date(), pause, timezone);

      return (
        <div className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary p-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4">
          <Typography
            bold
            type={TypographyType.Body}
            className="min-w-0 flex-1"
          >
            {isRunning
              ? `Paused until ${formatStreakPauseDate(pause.end)}`
              : `Paused from ${formatStreakPauseDate(
                  pause.start,
                )} to ${formatStreakPauseDate(pause.end)}`}
          </Typography>
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            className="self-start tablet:self-auto"
            onClick={onCancel}
            loading={isCancelling}
          >
            Cancel pause
          </Button>
        </div>
      );
    }

    return (
      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <div className="flex flex-col gap-3 tablet:flex-row">
          <label
            htmlFor="streak-pause-start"
            className="flex flex-1 flex-col gap-1"
          >
            <span className="text-text-tertiary typo-footnote">From</span>
            <input
              type="date"
              id="streak-pause-start"
              name="streak-pause-start"
              className={dateInputClassName}
              min={tomorrow}
              max={maxStart}
              value={start}
              disabled={!canPause}
              onChange={(event) => onStartChange(event.target.value)}
            />
          </label>
          <label
            htmlFor="streak-pause-end"
            className="flex flex-1 flex-col gap-1"
          >
            <span className="text-text-tertiary typo-footnote">Until</span>
            <input
              type="date"
              id="streak-pause-end"
              name="streak-pause-end"
              className={dateInputClassName}
              min={start || tomorrow}
              max={maxEnd || undefined}
              value={end}
              disabled={!canPause || !start}
              onChange={(event) => setEnd(event.target.value)}
            />
          </label>
        </div>
        {!canPause && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            You can pause once your streak reaches {MIN_STREAK_FOR_PAUSE} days.
          </Typography>
        )}
        <Button
          type="submit"
          variant={ButtonVariant.Secondary}
          className="self-start"
          disabled={!canPause || !isValidRange}
          loading={isScheduling}
        >
          Pause streak
        </Button>
      </form>
    );
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Subhead}>
          Pause my streak
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {streakPauseHelperCopy}
        </Typography>
      </div>
      {renderBody()}
    </section>
  );
};
