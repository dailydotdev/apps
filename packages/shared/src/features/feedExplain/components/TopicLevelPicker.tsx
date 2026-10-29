import type { ReactElement } from 'react';
import React from 'react';
import { formatBoost } from '../describe';
import type { FeedControl } from '../types';
import { FeedTopicMode } from '../types';
import type { ControlValue } from '../useFeedControls';
import type { Level } from './LevelPicker';
import { LevelPicker } from './LevelPicker';

export const topicLevels: Level<FeedTopicMode>[] = [
  {
    mode: FeedTopicMode.Boost,
    label: 'Show more',
    effect:
      "Ranks its posts higher and brings them in, even if you don't follow it.",
    activeClassName: 'text-accent-avocado-default',
  },
  {
    mode: null,
    label: 'Auto',
    effect: 'Your follows and reading decide how much it counts.',
  },
  {
    mode: FeedTopicMode.Demote,
    label: 'Show less',
    effect: 'Ranks its posts lower. The best ones still show.',
    activeClassName: 'text-accent-bun-default',
  },
  {
    mode: FeedTopicMode.StopLearning,
    label: 'Stop learning',
    effect: 'Reading about it stops counting. Following it still does.',
    activeClassName: 'text-accent-ketchup-default',
  },
  {
    mode: FeedTopicMode.Off,
    label: 'Off',
    effect:
      'It stops counting in For You, but its posts can still come in through other topics or your follows.',
    activeClassName: 'text-accent-ketchup-default',
  },
];

// An exact topic weight, the range the API takes. 0 is off.
export const topicWeightRange = { min: 0, max: 1.5, step: 0.05 };

export const formatTopicWeight = (weight: number): string =>
  weight > 0 ? formatBoost(weight) : 'Off';

interface TopicLevelPickerProps {
  tag: string;
  weight: number;
  /** The weight comes from a level or weight the reader set. */
  isSet: boolean;
  control?: FeedControl<FeedTopicMode>;
  onChange: (value: ControlValue<FeedTopicMode>) => void;
}

/** How much a topic counts in For You, which opens its levels. */
export const TopicLevelPicker = ({
  tag,
  weight,
  isSet,
  control,
  onChange,
}: TopicLevelPickerProps): ReactElement => (
  <LevelPicker
    subject={`#${tag}`}
    display={formatBoost(weight)}
    isSet={isSet}
    tooltip={`How much posts about #${tag} count in For You. Open it to change the level.`}
    levels={topicLevels}
    control={control}
    exact={{ ...topicWeightRange, value: weight, format: formatTopicWeight }}
    onChange={onChange}
  />
);
