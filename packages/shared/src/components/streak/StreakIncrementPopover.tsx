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
} from '../../lib/streakMilestones';

type PopoverPhase = 'enter' | 'filling' | 'complete' | 'fading' | 'exit';

interface StreakIncrementPopoverProps {
  fromStreak: number;
  toStreak: number;
}

export function StreakIncrementPopover({
  fromStreak,
  toStreak,
}: StreakIncrementPopoverProps): ReactElement | null {
  const [phase, setPhase] = useState<PopoverPhase>('enter');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('filling'), 200),
      setTimeout(() => setPhase('complete'), 1200),
      setTimeout(() => setPhase('fading'), 2400),
      setTimeout(() => setPhase('exit'), 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === 'exit') {
    return null;
  }

  const currentTier = getCurrentTier(toStreak);
  const nextMilestone = getNextMilestone(toStreak);

  const isFilling = phase === 'filling' || phase === 'complete';
  const progress = isFilling ? 100 : 0;

  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-56 -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2 transition-all',
        phase === 'enter' && 'scale-95 opacity-0 duration-300',
        phase === 'fading' && 'scale-95 opacity-0 duration-500',
        phase !== 'enter' && phase !== 'fading' && 'scale-100 opacity-100 duration-300',
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ReadingStreakIcon secondary className="text-accent-bacon-default" />
          <Typography bold type={TypographyType.Callout}>
            Day {toStreak}!
          </Typography>
        </div>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="text-accent-bacon-default"
          bold
        >
          {currentTier.label}
        </Typography>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={classNames(
            'font-bold tabular-nums typo-body transition-all duration-500',
            isFilling ? 'text-text-quaternary' : 'text-text-primary',
          )}
        >
          {fromStreak}
        </span>

        <div className="h-1.5 flex-1 overflow-hidden rounded-4 bg-surface-float">
          <div
            className="h-full bg-accent-bacon-default"
            style={{
              width: `${progress}%`,
              transition: isFilling
                ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'none',
            }}
          />
        </div>

        <span
          className={classNames(
            'font-bold tabular-nums typo-body transition-all duration-500',
            isFilling ? 'text-text-primary' : 'text-text-quaternary',
          )}
        >
          {toStreak}
        </span>
      </div>

      {nextMilestone && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Quaternary}
          className="mt-1.5 text-center"
        >
          {nextMilestone.day - toStreak}d to {nextMilestone.label}
        </Typography>
      )}
    </div>
  );
}
