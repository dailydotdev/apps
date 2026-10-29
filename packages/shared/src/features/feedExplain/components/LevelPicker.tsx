import type { KeyboardEvent, ReactElement } from 'react';
import React, { useId, useRef, useState } from 'react';
import classNames from 'classnames';
import { Popover, PopoverTrigger } from '@radix-ui/react-popover';
import { PopoverContent } from '../../../components/popover/Popover';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import type { FeedControl, FeedControlDuration } from '../types';
import type { ControlValue } from '../useFeedControls';
import { formatUntil, getDurationFor } from '../duration';
import { DurationPicker } from './DurationPicker';
import { ExactWeightSlider } from './ExactWeightSlider';
import { PlusSection } from './PlusUpsell';

export interface Level<Mode> {
  /** No mode is Auto. */
  mode: Mode | null;
  label: string;
  effect: string;
  activeClassName?: string;
}

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

export interface ExactWeightRange {
  /** The weight the feed ranks with now, where the slider starts. */
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
}

interface LevelPickerProps<Mode> {
  /** "#docker" or a source's name, for the labels. */
  subject: string;
  /** The value on the trigger, like ×1.62. */
  display: string;
  /** The value comes from a level or weight the reader set. */
  isSet: boolean;
  tooltip: string;
  levels: Level<Mode>[];
  control?: FeedControl<Mode>;
  exact: ExactWeightRange;
  /** What Auto would give it, like ×1.30, when known. */
  autoDisplay?: string;
  onChange: (value: ControlValue<Mode>) => void;
}

/**
 * How much a topic or source counts in For You, which opens its levels and,
 * under Plus, an exact boost and how long a change lasts. Free readers see
 * the Plus part locked.
 */
export const LevelPicker = <Mode,>({
  subject,
  display,
  isSet,
  tooltip,
  levels,
  control,
  exact,
  autoDisplay,
  onChange,
}: LevelPickerProps<Mode>): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState<FeedControlDuration>();
  const titleId = useId();
  const checkedRef = useRef<HTMLButtonElement>(null);
  const hasExactWeight = !!control?.weight;
  const activeLevel = hasExactWeight
    ? undefined
    : levels.find((level) => level.mode === (control?.mode ?? null));
  const valueClassName = isSet
    ? 'text-accent-cabbage-default'
    : 'text-text-secondary';
  // A new duration re-times what is set, as picking the level again would.
  const onDuration = (next: FeedControlDuration | undefined) => {
    setDuration(next);
    if (control?.mode) {
      onChange({ mode: control.mode, duration: next });
    } else if (control?.weight) {
      onChange({ weight: control.weight, duration: next });
    }
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setDuration(isPlus ? getDurationFor(control?.expiresAt) : undefined);
      }}
    >
      <Tooltip content={tooltip}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Boost for ${subject}: ${display}`}
            className={classNames(
              'relative flex h-5 shrink-0 items-center rounded-6 px-1.5 font-bold tabular-nums transition-colors typo-caption1 before:absolute before:-inset-1',
              isOpen
                ? 'bg-surface-hover'
                : 'bg-surface-float hover:bg-surface-hover',
              valueClassName,
            )}
          >
            {display}
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={16}
        aria-labelledby={titleId}
        className="z-popup flex max-h-[calc(var(--radix-popover-content-available-height)-1rem)] w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 overflow-y-auto rounded-16 border border-border-subtlest-tertiary bg-background-popover p-3 shadow-3"
        onClick={(event) => event.stopPropagation()}
        // The Esc that closes the levels is theirs: stop it before it
        // reaches the full explanation, which closes on the same key.
        onEscapeKeyDown={(event) => event.stopPropagation()}
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
            {subject} in For You
          </span>
          <span
            className={classNames(
              'shrink-0 tabular-nums typo-callout',
              valueClassName,
            )}
          >
            {display}
          </span>
        </span>
        {control?.expiresAt && (
          <span className="-mt-1.5 text-text-tertiary typo-caption1">
            {activeLevel?.label ?? 'Exact boost'}{' '}
            {formatUntil(control.expiresAt)}, then back to Auto.
          </span>
        )}
        <div
          role="radiogroup"
          aria-label={`Level for ${subject}`}
          className="-mx-1 flex flex-col"
        >
          {levels.map((level) => {
            const isActive = level === activeLevel;
            return (
              <button
                key={level.label}
                ref={isActive ? checkedRef : undefined}
                type="button"
                role="radio"
                aria-checked={isActive}
                tabIndex={isActive || (hasExactWeight && !level.mode) ? 0 : -1}
                onKeyDown={onLevelKeyDown}
                onClick={() => {
                  setIsOpen(false);
                  if (!isActive) {
                    onChange({
                      mode: level.mode,
                      duration: level.mode ? duration : undefined,
                    });
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
        <PlusSection>
          <ExactWeightSlider
            label={`Exact boost for ${subject}`}
            value={control?.weight ?? exact.value}
            min={exact.min}
            max={exact.max}
            step={exact.step}
            format={exact.format}
            isSet={isSet}
            isLocked={!isPlus}
            onCommit={(weight) => onChange({ weight, duration })}
          />
          <DurationPicker value={duration} onChange={onDuration} />
          {!isPlus && hasExactWeight && (
            <span className="text-text-tertiary typo-caption1">
              Your exact boost counts again with Plus.
            </span>
          )}
        </PlusSection>
        <footer className="flex min-h-6 items-center border-t border-border-subtlest-tertiary pt-3 text-text-quaternary typo-caption1">
          {control ? (
            <Button
              type="button"
              variant={ButtonVariant.Tertiary}
              size={ButtonSize.XSmall}
              className="-ml-1.5"
              onClick={() => {
                setIsOpen(false);
                onChange({ mode: null });
              }}
            >
              Back to Auto{autoDisplay && ` (${autoDisplay})`}
            </Button>
          ) : (
            <span>Changes apply when you refresh.</span>
          )}
        </footer>
      </PopoverContent>
    </Popover>
  );
};
