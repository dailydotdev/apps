import type { ReactElement } from 'react';
import React from 'react';
import type { FeedControl } from '../types';
import { FeedSourceMode } from '../types';
import type { ControlValue } from '../useFeedControls';
import type { Level } from './LevelPicker';
import { LevelPicker } from './LevelPicker';

const sourceLevels: Level<FeedSourceMode>[] = [
  {
    mode: null,
    label: 'Auto',
    effect: 'Following it decides how much it counts.',
  },
  {
    mode: FeedSourceMode.Demote,
    label: 'Show less',
    effect: 'Ranks its posts lower. The best ones still show.',
    activeClassName: 'text-accent-bun-default',
  },
];

// An exact source weight, the range the API takes: a multiplier.
export const sourceWeightRange = { min: 0.1, max: 3, step: 0.05 };

export const formatSourceWeight = (weight: number): string =>
  `×${weight.toFixed(2)}`;

interface SourceLevelPickerProps {
  name: string;
  /** The multiplier its posts get now: a follow's, or 1. */
  factor: number;
  control?: FeedControl<FeedSourceMode>;
  onChange: (value: ControlValue<FeedSourceMode>) => void;
}

/** How much a source counts in For You, which opens its levels. */
export const SourceLevelPicker = ({
  name,
  factor,
  control,
  onChange,
}: SourceLevelPickerProps): ReactElement => {
  const weight = control?.weight ?? factor;

  return (
    <LevelPicker
      subject={name}
      display={formatSourceWeight(weight)}
      isSet={!!control}
      tooltip={`How much posts from ${name} count in For You. Open it to change the level.`}
      levels={sourceLevels}
      control={control}
      exact={{
        ...sourceWeightRange,
        value: weight,
        format: formatSourceWeight,
      }}
      onChange={onChange}
    />
  );
};
