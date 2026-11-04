import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Slider } from '../../../components/fields/Slider';

interface ExactWeightSliderProps {
  label: string;
  /** The weight as the feed ranks with it, set or computed. */
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  /** The reader set this weight, so it no longer follows the feed. */
  isSet: boolean;
  /** A free reader sees the value but can't change it. */
  isLocked?: boolean;
  /** Called once the reader lets go, not on every step of a drag. */
  onCommit: (value: number) => void;
}

/** An exact boost for one topic or source, a Plus control. */
export const ExactWeightSlider = ({
  label,
  value,
  min,
  max,
  step,
  format,
  isSet,
  isLocked,
  onCommit,
}: ExactWeightSliderProps): ReactElement => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-3 text-text-tertiary typo-caption1">
        Exact boost
        <span
          className={classNames(
            'tabular-nums typo-footnote',
            isLocked && 'text-text-quaternary',
            !isLocked && isSet && 'text-accent-cabbage-default',
            !isLocked && !isSet && 'text-text-secondary',
          )}
        >
          {format(draft)}
        </span>
      </span>
      <div
        className={classNames(
          'flex',
          isLocked && 'pointer-events-none opacity-40 grayscale',
        )}
      >
        <Slider
          compact
          className="flex-1"
          min={min}
          max={max}
          step={step}
          value={[Math.min(max, Math.max(min, draft))]}
          thumbLabel={label}
          disabled={isLocked}
          onValueChange={([next]) => setDraft(next)}
          onValueCommit={([next]) => onCommit(next)}
        />
      </div>
    </div>
  );
};
