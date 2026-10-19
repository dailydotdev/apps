import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { Interest } from '../../policy/profile';
import { SourceMode } from '../../policy/rank';
import {
  Duration,
  expiryKey,
  formatUntil,
  getUntil,
  getUntilFor,
} from '../../policy/timed';
import { FeedAction, glossary } from '../../policy/glossary';
import { usePersonalization } from '../PersonalizationContext';
import {
  getLevelOption,
  getTopicLevel,
  isTimedLocked,
  Level,
  PlusDurationPicker,
  SourceLevelPicker,
  TopicLevelPicker,
} from '../plus';

/** The picker's choice for a change that is already running. */
export const getDurationFor = (
  until: number | undefined,
  now: number,
): Duration => {
  if (until === undefined) {
    return Duration.Ongoing;
  }
  return until <= (getUntil(Duration.ThreeDays, now) ?? 0)
    ? Duration.ThreeDays
    : Duration.Week;
};

/** How long a level lasts, and when it ends, under the level picker. */
const LevelTiming = ({
  verb,
  until,
  duration,
  onChange,
}: {
  verb: string;
  until?: number;
  duration: Duration;
  onChange: (duration: Duration) => void;
}): ReactElement => {
  const { now } = usePersonalization();

  return (
    <span className="flex flex-col gap-1.5">
      <PlusDurationPicker value={duration} onChange={onChange} />
      {until !== undefined && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {verb} {formatUntil(until, now)}, then back to Auto.
        </Typography>
      )}
    </span>
  );
};

/** A topic's level, with how long it lasts, as a card's topic popover has it. */
export const TimedTopicLevel = ({
  tag,
  interest,
}: {
  tag: string;
  interest?: Interest;
}): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const control = store.state.controls[tag];
  const until = getUntilFor(store.state, expiryKey.topic(tag));
  const [duration, setDuration] = useState(() =>
    getDurationFor(until, store.now),
  );

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-2">
      <TopicLevelPicker
        tag={tag}
        interest={interest}
        duration={isTimedLocked(duration, isPlus) ? undefined : duration}
      />
      {control?.mode && (
        <LevelTiming
          verb={getLevelOption(getTopicLevel(control) ?? Level.Auto, '').label}
          until={until}
          duration={duration}
          onChange={(next) => {
            setDuration(next);
            store.setTopicMode(tag, control.mode, next);
          }}
        />
      )}
    </span>
  );
};

/** A source's level, with how long it lasts. */
export const TimedSourceLevel = ({
  source,
  display,
}: {
  source: { id: string; name: string };
  display: string;
}): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const mode = store.state.sourceControls[source.id];
  const until = getUntilFor(store.state, expiryKey.source(source.id));
  const [duration, setDuration] = useState(() =>
    getDurationFor(until, store.now),
  );

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-2">
      <SourceLevelPicker
        source={source}
        display={display}
        duration={isTimedLocked(duration, isPlus) ? undefined : duration}
      />
      {mode === SourceMode.Demoted && (
        <LevelTiming
          verb={glossary[FeedAction.ShowLess].verb}
          until={until}
          duration={duration}
          onChange={(next) => {
            setDuration(next);
            store.setSourceMode(source, mode, next);
          }}
        />
      )}
    </span>
  );
};
