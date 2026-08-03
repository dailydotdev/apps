import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import styles from '../WeeklyQuiz.module.css';

interface WeeklyQuizCountdownProps {
  onComplete: () => void;
  onTick: () => void;
}

const SEQUENCE = [3, 2, 1];
const STEP_MS = 850;

// A 3-2-1 countdown before the first question. Each number pops in and fires a
// beep via onTick; after the last one it calls onComplete, which starts the
// quiz (and the total timer). Keeps the timer honest by running before the
// clock, not during it.
export const WeeklyQuizCountdown = ({
  onComplete,
  onTick,
}: WeeklyQuizCountdownProps): ReactElement => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    onTick();
    const timeout = window.setTimeout(() => {
      if (index < SEQUENCE.length - 1) {
        setIndex((current) => current + 1);
      } else {
        onComplete();
      }
    }, STEP_MS);

    return () => window.clearTimeout(timeout);
    // onTick/onComplete are stable (useCallback in the audio/game hooks).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="flex h-80 flex-col items-center justify-center gap-4">
      <Typography
        type={TypographyType.Title3}
        bold
        className="uppercase tracking-widest !text-text-tertiary"
      >
        Get ready…
      </Typography>
      <span
        key={SEQUENCE[index]}
        className={classNames(
          'flex animate-reward-pop items-center justify-center font-bold typo-giga1 motion-reduce:animate-none',
          styles.countNumber,
        )}
        aria-live="assertive"
      >
        {SEQUENCE[index]}
      </span>
      <Typography
        type={TypographyType.Callout}
        className="max-w-sm text-center !text-text-tertiary"
      >
        Think fast and answer quickly — speed and knowledge both count.
      </Typography>
    </div>
  );
};
