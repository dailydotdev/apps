import type { KeyboardEvent, ReactElement } from 'react';
import React, { useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/popover/Popover';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { formatBoost } from '../describe';
import { FeedTopicMode } from '../types';

interface TopicLevel {
  /** No mode is Auto. */
  mode: FeedTopicMode | null;
  label: string;
  effect: string;
  activeClassName?: string;
}

export const topicLevels: TopicLevel[] = [
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

const levelKeySteps: Partial<Record<string, number>> = {
  ArrowDown: 1,
  ArrowRight: 1,
  ArrowUp: -1,
  ArrowLeft: -1,
};

// Arrow keys move between the levels. Picking one changes the feed and
// closes the picker, so that waits for Enter or Space.
const onLevelKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
  const step = levelKeySteps[event.key];
  if (!step) {
    return;
  }
  event.preventDefault();
  const radios = Array.from(
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    ) ?? [],
  );
  const index = radios.indexOf(event.currentTarget);
  radios[(index + step + radios.length) % radios.length]?.focus();
};

interface TopicLevelPickerProps {
  tag: string;
  weight: number;
  /** The weight comes from a level or weight the reader set. */
  isSet: boolean;
  mode?: FeedTopicMode;
  onChange: (mode: FeedTopicMode | null) => void;
}

/** How much a topic counts in For You, which opens its levels. */
export const TopicLevelPicker = ({
  tag,
  weight,
  isSet,
  mode,
  onChange,
}: TopicLevelPickerProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const checkedRef = useRef<HTMLButtonElement>(null);
  const boost = formatBoost(weight);
  const valueClassName = isSet
    ? 'text-accent-cabbage-default'
    : 'text-text-secondary';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip
        content={`How much posts about #${tag} count in For You. Open it to change the level.`}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Boost for #${tag}: ${boost}`}
            className={classNames(
              'relative flex h-5 shrink-0 items-center rounded-6 px-1.5 font-bold tabular-nums transition-colors typo-caption1 before:absolute before:-inset-1',
              isOpen
                ? 'bg-surface-hover'
                : 'bg-surface-float hover:bg-surface-hover',
              valueClassName,
            )}
          >
            {boost}
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={16}
        aria-labelledby={titleId}
        className="z-popup flex max-h-[calc(var(--radix-popover-content-available-height)-1rem)] w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 overflow-y-auto rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3"
        onClick={(event) => event.stopPropagation()}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          checkedRef.current?.focus();
        }}
      >
        <span className="flex items-baseline justify-between gap-3">
          <span
            id={titleId}
            className="min-w-0 shrink truncate font-bold text-text-primary typo-callout"
          >
            #{tag} in For You
          </span>
          <span
            className={classNames(
              'shrink-0 tabular-nums typo-callout',
              valueClassName,
            )}
          >
            {boost}
          </span>
        </span>
        <div
          role="radiogroup"
          aria-label={`Level for #${tag}`}
          className="-mx-1 flex flex-col"
        >
          {topicLevels.map((level) => {
            const isActive = (mode ?? null) === level.mode;
            return (
              <button
                key={level.label}
                ref={isActive ? checkedRef : undefined}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={onLevelKeyDown}
                onClick={() => {
                  setIsOpen(false);
                  if (!isActive) {
                    onChange(level.mode);
                  }
                }}
                className={classNames(
                  'flex w-full items-start gap-2 rounded-10 px-2 py-1.5 text-left transition-colors hover:bg-surface-hover',
                  isActive && 'bg-surface-float',
                )}
              >
                <span
                  className={classNames(
                    'mt-1 flex size-3.5 items-center justify-center rounded-max border-2',
                    isActive
                      ? 'border-accent-cabbage-default'
                      : 'border-border-subtlest-primary',
                  )}
                >
                  {isActive && (
                    <span className="size-1.5 rounded-max bg-accent-cabbage-default" />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={classNames(
                      'font-bold typo-footnote',
                      (isActive && level.activeClassName) ||
                        'text-text-primary',
                    )}
                  >
                    {level.label}
                  </span>
                  <span className="text-text-tertiary typo-caption1">
                    {level.effect}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <span className="border-t border-border-subtlest-tertiary pt-2 text-text-quaternary typo-caption1">
          Changes apply when you refresh.
        </span>
      </PopoverContent>
    </Popover>
  );
};
