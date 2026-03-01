import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';
import { Typography, TypographyType } from '../typography/Typography';

type PopoverPhase = 'enter' | 'filling' | 'complete' | 'fading' | 'exit';
type IconPhase = 'circle' | 'outline' | 'filled';

interface StreakIncrementPopoverProps {
  fromStreak: number;
  toStreak: number;
}

export function StreakIncrementPopover({
  toStreak,
}: StreakIncrementPopoverProps): ReactElement | null {
  const [phase, setPhase] = useState<PopoverPhase>('enter');
  const [iconPhase, setIconPhase] = useState<IconPhase>('circle');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('filling'), 0),
      setTimeout(() => setPhase('complete'), 2800),
      setTimeout(() => setPhase('fading'), 4200),
      setTimeout(() => setPhase('exit'), 5000),

      // Icon animation sequence
      setTimeout(() => setIconPhase('outline'), 400),
      setTimeout(() => setIconPhase('filled'), 850),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === 'exit') {
    return null;
  }

  return (
    <div
      className={classNames(
        'absolute left-1/2 top-full z-max mt-2 w-fit -translate-x-1/2 rounded-16 border border-border-subtlest-tertiary bg-background-default px-3 py-2 shadow-2 transition-all tablet:left-auto tablet:right-0 tablet:translate-x-0 laptop:left-1/2 laptop:right-auto laptop:-translate-x-1/2',
        phase === 'enter' && 'scale-95 opacity-0 duration-300',
        phase === 'fading' && 'scale-95 opacity-0 duration-500',
        phase !== 'enter' &&
          phase !== 'fading' &&
          'scale-100 opacity-100 duration-300',
      )}
    >
      <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
        <div
          className={classNames(
            'relative flex size-7 items-center justify-center rounded-full transition-colors duration-500',
            iconPhase === 'filled'
              ? 'bg-accent-bacon-default/10'
              : 'bg-transparent',
          )}
        >
          {iconPhase === 'filled' && (
            <span className="bg-accent-bacon-default/20 absolute inset-0 animate-streak-pulse rounded-full" />
          )}

          {/* Hollow Circle */}
          <div
            className={classNames(
              'absolute size-4 rounded-full border-[1.5px] border-border-subtlest-tertiary transition-all duration-300',
              iconPhase === 'circle'
                ? 'scale-100 opacity-100'
                : 'scale-50 opacity-0',
            )}
          />

          {/* Outlined Flame */}
          <ReadingStreakIcon
            className={classNames(
              'absolute size-4 text-accent-bacon-default transition-all duration-300',
              iconPhase === 'outline'
                ? 'scale-100 opacity-100'
                : 'scale-50 opacity-0',
            )}
          />

          {/* Filled Flame */}
          <ReadingStreakIcon
            secondary
            className={classNames(
              'absolute size-4 text-accent-bacon-default transition-opacity duration-300',
              iconPhase === 'filled'
                ? 'animate-streak-bounce opacity-100'
                : 'opacity-0',
            )}
          />
        </div>
        <Typography bold type={TypographyType.Callout}>
          Day {toStreak}!
        </Typography>
      </div>
    </div>
  );
}
