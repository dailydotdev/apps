import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  getCurrentTier,
  getNextMilestone,
  getTierProgress,
} from '../../lib/streakMilestones';

type PopoverPhase = 'enter' | 'visible' | 'fading' | 'exit';

interface StreakReminderPopoverProps {
  currentStreak: number;
}

export function StreakReminderPopover({
  currentStreak,
}: StreakReminderPopoverProps): ReactElement | null {
  const [phase, setPhase] = useState<PopoverPhase>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('visible'), 200),
      setTimeout(() => setPhase('fading'), 3200),
      setTimeout(() => setPhase('exit'), 3800),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'exit') {
    return null;
  }

  const currentTier = getCurrentTier(currentStreak);
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = getTierProgress(currentStreak);

  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-56 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 transition-all',
        phase === 'enter' && 'scale-95 opacity-0 duration-300',
        phase === 'fading' && 'scale-95 opacity-0 duration-500',
        phase !== 'enter' &&
          phase !== 'fading' &&
          'scale-100 opacity-100 duration-300',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ReadingStreakIcon className="text-text-quaternary" />
          <Typography bold type={TypographyType.Callout}>
            Don&apos;t lose your streak!
          </Typography>
        </div>
      </div>

      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
        className="mb-2"
      >
        Read today to keep your {currentStreak}-day streak alive.
      </Typography>

      <div className="flex items-center gap-2">
        <span className="font-bold tabular-nums text-text-primary typo-caption1">
          {currentTier.label}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{ width: `${progress}%` }}
          />
        </div>

        {nextMilestone && (
          <span className="font-bold tabular-nums text-text-quaternary typo-caption1">
            {nextMilestone.label}
          </span>
        )}
      </div>

      {nextMilestone && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="mt-1.5 text-center"
        >
          {nextMilestone.day - currentStreak}d to {nextMilestone.label}
        </Typography>
      )}
    </div>
  );
}
