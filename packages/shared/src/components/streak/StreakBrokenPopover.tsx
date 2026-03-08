import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';

type PopoverPhase = 'enter' | 'visible' | 'fading' | 'exit';

interface StreakBrokenPopoverProps {
  previousStreak: number;
}

export function StreakBrokenPopover({
  previousStreak,
}: StreakBrokenPopoverProps): ReactElement | null {
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
      <div className="mb-2 flex items-center gap-1.5">
        <ReadingStreakIcon className="text-text-quaternary" />
        <Typography bold type={TypographyType.Callout}>
          Streak lost
        </Typography>
      </div>

      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        Your {previousStreak}-day streak has been reset. Start reading again to
        build it back!
      </Typography>
    </div>
  );
}
