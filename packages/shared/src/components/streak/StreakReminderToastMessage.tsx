import type { ReactElement } from 'react';
import React from 'react';
import { ReadingStreakIcon } from '../icons';

interface StreakReminderToastMessageProps {
  currentStreak: number;
}

export function StreakReminderToastMessage({
  currentStreak,
}: StreakReminderToastMessageProps): ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      <ReadingStreakIcon className="shrink-0" />
      <span className="font-bold">
        {`Read today to keep your streak alive · Day #${currentStreak.toString()}.`}
      </span>
    </div>
  );
}
