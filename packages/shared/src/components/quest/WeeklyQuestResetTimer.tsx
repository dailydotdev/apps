import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Tooltip } from '../tooltip/Tooltip';
import {
  getDaysUntilWeeklyQuestReset,
  getWeeklyQuestPeriodEnd,
} from '../../lib/date';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';

export const WeeklyQuestResetTimer = (): ReactElement => {
  const { label, tooltip } = useMemo(() => {
    const now = new Date();
    // Period end is a UTC instant, so format in UTC to keep the calendar date
    // aligned with the days-remaining count.
    const formattedDate = formatInTimeZone(
      getWeeklyQuestPeriodEnd(now),
      DEFAULT_TIMEZONE,
      'EEE, MMM d',
    );

    return {
      label: `${getDaysUntilWeeklyQuestReset(now)}d left`,
      tooltip: `Weekly quests reset ${formattedDate}`,
    };
  }, []);

  return (
    <Tooltip content={tooltip} side="top">
      <span className="text-text-secondary typo-footnote">{label}</span>
    </Tooltip>
  );
};

export default WeeklyQuestResetTimer;
