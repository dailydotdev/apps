import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Slider } from '../../../components/fields/Slider';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { RefreshIcon } from '../../../components/icons/Refresh';

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
  resetLabel: string;
  /** Called once the reader lets go, not on every step of a drag. */
  onCommit: (value: number) => void;
  onReset: () => void;
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
  resetLabel,
  onCommit,
  onReset,
}: ExactWeightSliderProps): ReactElement => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <span className="flex min-w-0 items-center gap-2">
      <Slider
        compact
        className={classNames(
          'flex-1',
          isLocked && 'cursor-not-allowed opacity-40',
        )}
        min={min}
        max={max}
        step={step}
        value={[Math.min(max, Math.max(min, draft))]}
        thumbLabel={label}
        disabled={isLocked}
        onValueChange={([next]) => setDraft(next)}
        onValueCommit={([next]) => onCommit(next)}
      />
      <span
        className={classNames(
          'w-14 shrink-0 text-right tabular-nums typo-callout',
          isSet ? 'text-accent-cabbage-default' : 'text-text-secondary',
        )}
      >
        {format(draft)}
      </span>
      <Button
        type="button"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.XSmall}
        icon={<RefreshIcon />}
        aria-label={resetLabel}
        title={resetLabel}
        className={classNames('shrink-0', (!isSet || isLocked) && 'invisible')}
        onClick={onReset}
      />
    </span>
  );
};
