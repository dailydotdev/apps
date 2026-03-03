import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '../icons';

type IconPhase = 'circle' | 'outline' | 'filled';

interface StreakIncrementToastMessageProps {
  currentStreak: number;
}

export function StreakIncrementToastMessage({
  currentStreak,
}: StreakIncrementToastMessageProps): ReactElement {
  const [iconPhase, setIconPhase] = useState<IconPhase>('circle');

  useEffect(() => {
    const timers = [
      setTimeout(() => setIconPhase('outline'), 400),
      setTimeout(() => setIconPhase('filled'), 850),
    ];

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <div
        className={classNames(
          'relative flex size-7 items-center justify-center rounded-full transition-colors duration-500',
          iconPhase === 'filled' ? 'bg-accent-bacon-default/10' : 'bg-transparent',
        )}
      >
        {iconPhase === 'filled' && (
          <span className="bg-accent-bacon-default/20 absolute inset-0 animate-streak-pulse rounded-full" />
        )}

        <div
          className={classNames(
            'absolute size-4 rounded-full border-[1.5px] border-border-subtlest-tertiary transition-all duration-300',
            iconPhase === 'circle' ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />

        <ReadingStreakIcon
          className={classNames(
            'absolute size-4 text-accent-bacon-default transition-all duration-300',
            iconPhase === 'outline' ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          )}
        />

        <ReadingStreakIcon
          secondary
          className={classNames(
            'absolute size-4 text-accent-bacon-default transition-opacity duration-300',
            iconPhase === 'filled' ? 'animate-streak-bounce opacity-100' : 'opacity-0',
          )}
        />
      </div>

      <span className="font-bold">
        {`Another day, another streak · Day #${currentStreak.toString()}`}
      </span>
    </div>
  );
}
