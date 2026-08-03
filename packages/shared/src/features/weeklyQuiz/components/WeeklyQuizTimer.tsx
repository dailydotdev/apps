import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import { TimerIcon } from '../../../components/icons';
import { IconSize } from '../../../components/Icon';

interface WeeklyQuizTimerProps {
  elapsedMs: number;
  isPaused: boolean;
}

export const formatElapsed = (elapsedMs: number): string => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// The running total timer. Ticks up while the player is thinking and freezes
// (dimmed) while feedback is on screen, so reading feedback never costs time.
export const WeeklyQuizTimer = ({
  elapsedMs,
  isPaused,
}: WeeklyQuizTimerProps): ReactElement => {
  return (
    <div
      className={classNames(
        'flex items-center gap-1.5 text-text-primary transition-opacity',
        isPaused && 'opacity-60',
      )}
      role="timer"
      aria-live="off"
    >
      <TimerIcon size={IconSize.XSmall} />
      <Typography
        type={TypographyType.Callout}
        bold
        className="tabular-nums !text-text-primary"
      >
        {formatElapsed(elapsedMs)}
      </Typography>
    </div>
  );
};
