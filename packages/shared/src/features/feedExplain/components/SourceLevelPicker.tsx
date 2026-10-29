import type { ReactElement } from 'react';
import React from 'react';
import type { FeedControl } from '../types';
import { FeedSourceMode } from '../types';
import type { ControlValue } from '../useFeedControls';
import type { Level } from './LevelPicker';
import { LevelPicker } from './LevelPicker';

const sourceLevels: Level<FeedSourceMode>[] = [
  {
    mode: FeedSourceMode.Boost,
    label: 'Show more',
    effect:
      "Ranks its posts higher and brings them in, even if you don't follow it.",
    activeClassName: 'text-accent-avocado-default',
  },
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
  {
    mode: FeedSourceMode.Off,
    label: 'Off',
    effect:
      'For You ignores your follow. Its posts can still come in through your topics. You still follow it everywhere else.',
    activeClassName: 'text-accent-ketchup-default',
  },
];

// An exact source or author weight, the range the API takes: a multiplier.
export const sourceWeightRange = { min: 0.1, max: 3, step: 0.05 };

export const formatSourceWeight = (weight: number): string =>
  `×${weight.toFixed(2)}`;

/** Off ignores a follow, so it is only offered on one, or when already set. */
export const getFollowLevels = <Mode,>(
  levels: Level<Mode>[],
  off: Mode,
  isFollowed: boolean,
  control?: FeedControl<Mode>,
): Level<Mode>[] =>
  isFollowed || control?.mode === off
    ? levels
    : levels.filter(({ mode }) => mode !== off);

interface SourceLevelPickerProps {
  name: string;
  /** The multiplier its posts get now: a follow's, or 1. */
  factor: number;
  /** The reader follows it, or is in the squad. */
  isFollowed: boolean;
  control?: FeedControl<FeedSourceMode>;
  onChange: (value: ControlValue<FeedSourceMode>) => void;
}

/** How much a source counts in For You, which opens its levels. */
export const SourceLevelPicker = ({
  name,
  factor,
  isFollowed,
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
      levels={getFollowLevels(
        sourceLevels,
        FeedSourceMode.Off,
        isFollowed,
        control,
      )}
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
