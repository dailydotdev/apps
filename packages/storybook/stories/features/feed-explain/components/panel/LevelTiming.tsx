import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { Interest } from '../../policy/profile';
import { maxTopicWeight } from '../../policy/profile';
import { SourceMode } from '../../policy/rank';
import { formatParam, ParamFormat } from '../../policy/params';
import { formatBoost } from '../../policy/describe';
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
  PlusSection,
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

/** A row's boost, which opens its Plus part, like the boost on a card. */
const BoostChip = ({
  display,
  isSet,
  isOpen,
  tooltip,
  onToggle,
}: {
  display: string;
  isSet: boolean;
  isOpen: boolean;
  tooltip: string;
  onToggle: () => void;
}): ReactElement => (
  <Tooltip content={tooltip}>
    <button
      type="button"
      aria-expanded={isOpen}
      onClick={onToggle}
      className={classNames(
        'flex h-6 shrink-0 items-center rounded-6 px-1.5 font-bold tabular-nums typo-footnote transition-colors',
        isOpen ? 'bg-surface-hover' : 'bg-surface-float hover:bg-surface-hover',
        isSet ? 'text-accent-cabbage-default' : 'text-text-secondary',
      )}
    >
      {display}
    </button>
  </Tooltip>
);

/**
 * The Plus part of a row, as a card's topic popover has it: the exact boost,
 * and how long a level lasts once one is set.
 */
const RowPlusPart = ({
  label,
  value,
  min,
  max,
  display,
  isSet,
  onBoost,
  isLevelSet,
  duration,
  onDuration,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  isSet: boolean;
  onBoost: (value: number) => void;
  isLevelSet: boolean;
  duration: Duration;
  onDuration: (duration: Duration) => void;
}): ReactElement => (
  <PlusSection>
    {(isLocked) => (
      <>
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
              {display}
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
              disabled={isLocked}
              min={min}
              max={max}
              step={0.05}
              value={[value]}
              thumbLabel={label}
              onValueChange={([next]) => onBoost(next)}
            />
          </div>
        </div>
        {isLevelSet && (
          <PlusDurationPicker
            value={duration}
            onChange={onDuration}
            hasUpsell={false}
          />
        )}
      </>
    )}
  </PlusSection>
);

const UntilLine = ({
  verb,
  until,
}: {
  verb: string;
  until?: number;
}): ReactElement | null => {
  const { now } = usePersonalization();

  return until === undefined ? null : (
    <Typography type={TypographyType.Footnote} color={TypographyColor.Tertiary}>
      {verb} {formatUntil(until, now)}, then back to Auto.
    </Typography>
  );
};

/** Open while a level is set, and whenever the boost is tapped. */
const useRowOpen = (isLevelSet: boolean) => {
  const [isOpen, setIsOpen] = useState(isLevelSet);
  useEffect(() => {
    if (isLevelSet) {
      setIsOpen(true);
    }
  }, [isLevelSet]);
  return [isOpen, () => setIsOpen(!isOpen)] as const;
};

/** A topic's levels, then its exact boost and how long under Plus. */
export const TopicLevelControls = ({
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
  const isLevelSet = !!control?.mode;
  const [isOpen, onToggle] = useRowOpen(isLevelSet);
  const weight = interest?.weight ?? 0;
  const display = formatBoost(weight);

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-3">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <TopicLevelPicker
          tag={tag}
          interest={interest}
          hasValue={false}
          duration={isTimedLocked(duration, isPlus) ? undefined : duration}
        />
        <BoostChip
          display={display}
          isSet={!!control}
          isOpen={isOpen}
          tooltip={`How much posts about #${tag} count. Tap for the exact boost.`}
          onToggle={onToggle}
        />
      </span>
      {isOpen && (
        <RowPlusPart
          label={`Boost for #${tag}`}
          value={weight}
          min={0}
          max={maxTopicWeight}
          display={display}
          isSet={!!control}
          onBoost={(value) => store.setTopicWeight(tag, value)}
          isLevelSet={isLevelSet}
          duration={duration}
          onDuration={(next) => {
            setDuration(next);
            store.setTopicMode(tag, control?.mode, next);
          }}
        />
      )}
      {isLevelSet && (
        <UntilLine
          verb={getLevelOption(getTopicLevel(control) ?? Level.Auto, '').label}
          until={until}
        />
      )}
    </span>
  );
};

/** A source's levels, then its exact boost and how long under Plus. */
export const SourceLevelControls = ({
  source,
  value,
  automatic,
}: {
  source: { id: string; name: string };
  /** The boost its posts get now. */
  value: number;
  /** The boost it gets with no change of yours. */
  automatic: number;
}): ReactElement => {
  const store = usePersonalization();
  const { isPlus } = usePlusSubscription();
  const mode = store.state.sourceControls[source.id];
  const isExact = store.state.sourceWeights?.[source.id] !== undefined;
  const until = getUntilFor(store.state, expiryKey.source(source.id));
  const [duration, setDuration] = useState(() =>
    getDurationFor(until, store.now),
  );
  const isLevelSet = mode === SourceMode.Demoted;
  const [isOpen, onToggle] = useRowOpen(isLevelSet);
  const display = formatParam(ParamFormat.Multiplier, value);

  return (
    <span className="flex min-w-0 flex-1 flex-col gap-3">
      <span className="flex min-w-0 flex-wrap items-center gap-2">
        <SourceLevelPicker
          source={source}
          display={display}
          hasValue={false}
          duration={isTimedLocked(duration, isPlus) ? undefined : duration}
        />
        <BoostChip
          display={display}
          isSet={isExact || !!mode}
          isOpen={isOpen}
          tooltip={`How much posts from ${source.name} count, ${formatParam(
            ParamFormat.Multiplier,
            automatic,
          )} on Auto. Tap for the exact boost.`}
          onToggle={onToggle}
        />
      </span>
      {isOpen && (
        <RowPlusPart
          label={`Boost for ${source.name}`}
          value={value}
          min={0.25}
          max={3}
          display={display}
          isSet={isExact || !!mode}
          onBoost={(next) => store.setSourceWeight(source, next)}
          isLevelSet={isLevelSet}
          duration={duration}
          onDuration={(next) => {
            setDuration(next);
            store.setSourceMode(source, mode, next);
          }}
        />
      )}
      {isLevelSet && (
        <UntilLine verb={glossary[FeedAction.ShowLess].verb} until={until} />
      )}
    </span>
  );
};
