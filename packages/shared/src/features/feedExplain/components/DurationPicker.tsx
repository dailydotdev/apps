import type { ReactElement } from 'react';
import React from 'react';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { FeedControlDuration } from '../types';
import { durationOptions } from '../duration';
import { Segmented } from './Segmented';

interface DurationPickerProps {
  value: FeedControlDuration | undefined;
  onChange: (duration: FeedControlDuration | undefined) => void;
  label?: string;
}

/**
 * How long a change lasts. Until I change it is free; a few days or a week
 * is Plus, so free readers see those locked.
 */
export const DurationPicker = ({
  value,
  onChange,
  label = 'How long',
}: DurationPickerProps): ReactElement => {
  const { isPlus } = usePlusSubscription();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-text-tertiary typo-caption1">{label}</span>
      <Segmented
        label={label}
        value={isPlus ? value : undefined}
        options={durationOptions.map((option) => {
          const isLocked = !isPlus && !!option.value;
          return {
            ...option,
            isLocked,
            description: isLocked
              ? `${option.label} is a Plus feature.`
              : undefined,
          };
        })}
        onChange={onChange}
      />
    </div>
  );
};
