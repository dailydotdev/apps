import type { ReactElement } from 'react';
import React from 'react';

interface StreakReminderToastMessageProps {
  currentStreak: number;
}

export function StreakReminderToastMessage({
  currentStreak,
}: StreakReminderToastMessageProps): ReactElement {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent">
        <span className="border-white/70 pointer-events-none absolute inset-0.5 animate-streak-day-pop rounded-full border" />
        <div className="absolute size-4 rounded-full border-[1.5px] border-border-subtlest-tertiary" />
      </div>
      <span className="font-bold">
        {`Read today to keep your streak alive — Day #${currentStreak.toString()}.`}
      </span>
    </div>
  );
}
