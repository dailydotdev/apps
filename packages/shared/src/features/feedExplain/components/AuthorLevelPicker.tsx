import type { ReactElement } from 'react';
import React from 'react';
import type { FeedControl } from '../types';
import { FeedAuthorMode } from '../types';
import type { ControlValue } from '../useFeedControls';
import type { Level } from './LevelPicker';
import { LevelPicker } from './LevelPicker';
import {
  formatSourceWeight,
  getFollowLevels,
  sourceWeightRange,
} from './SourceLevelPicker';

const authorLevels: Level<FeedAuthorMode>[] = [
  {
    mode: FeedAuthorMode.Boost,
    label: 'Show more',
    effect:
      "Ranks their posts higher and brings them in, even if you don't follow them.",
    activeClassName: 'text-accent-avocado-default',
  },
  {
    mode: null,
    label: 'Auto',
    effect: 'Following them decides how much they count.',
  },
  {
    mode: FeedAuthorMode.Demote,
    label: 'Show less',
    effect: 'Ranks their posts lower. The best ones still show.',
    activeClassName: 'text-accent-bun-default',
  },
  {
    mode: FeedAuthorMode.Off,
    label: 'Off',
    effect:
      'For You ignores your follow. Their posts can still come in through your topics. You still follow them everywhere else.',
    activeClassName: 'text-accent-ketchup-default',
  },
];

interface AuthorLevelPickerProps {
  name: string;
  /** The multiplier their posts get now: a follow's, or 1. */
  factor: number;
  isFollowed: boolean;
  control?: FeedControl<FeedAuthorMode>;
  onChange: (value: ControlValue<FeedAuthorMode>) => void;
}

/** How much an author counts in For You, which opens their levels. */
export const AuthorLevelPicker = ({
  name,
  factor,
  isFollowed,
  control,
  onChange,
}: AuthorLevelPickerProps): ReactElement => {
  const weight = control?.weight ?? factor;

  return (
    <LevelPicker
      subject={name}
      display={formatSourceWeight(weight)}
      isSet={!!control}
      tooltip={`How much posts by ${name} count in For You. Open it to change the level.`}
      levels={getFollowLevels(
        authorLevels,
        FeedAuthorMode.Off,
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
