import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { TimerIcon } from '../icons';
import { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import {
  getDaysUntilWeeklyQuestReset,
  getWeeklyQuestPeriodEnd,
} from '../../lib/date';
import { DEFAULT_TIMEZONE } from '../../lib/timezones';
import { pluralize } from '../../lib/strings';

export const WeeklyQuestResetTimer = (): ReactElement => {
  const { label, tooltip } = useMemo(() => {
    const now = new Date();
    const daysRemaining = getDaysUntilWeeklyQuestReset(now);
    const periodEnd = getWeeklyQuestPeriodEnd(now);
    // Period end is a UTC instant, so format in UTC to keep the calendar date
    // aligned with the days-remaining count.
    const formattedDate = formatInTimeZone(
      periodEnd,
      DEFAULT_TIMEZONE,
      'EEE, MMM d',
    );

    return {
      label:
        daysRemaining === 1
          ? 'Resets tomorrow'
          : `Resets in ${daysRemaining} ${pluralize('day', daysRemaining)}`,
      tooltip: `Weekly quests reset ${formattedDate}`,
    };
  }, []);

  return (
    <Tooltip content={tooltip} side="top">
      <span className="flex items-center gap-1 text-text-tertiary typo-caption1">
        <TimerIcon size={IconSize.Size16} />
        {label}
      </span>
    </Tooltip>
  );
};

export default WeeklyQuestResetTimer;
