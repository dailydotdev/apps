import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { ParamKey } from '../policy/params';
import type { Duration } from '../policy/timed';
import { durationOptions } from '../policy/timed';
import { defaultParams, formatParam, getParamMeta } from '../policy/params';
import { usePersonalization } from './PersonalizationContext';

export const Strong = ({ children }: { children: ReactNode }): ReactElement => (
  <strong className="font-bold text-text-primary">{children}</strong>
);

export interface SegmentOption<T> {
  value: T;
  label: string;
  activeClassName?: string;
  /** What picking it does, shown as a tooltip. */
  description?: string;
  /** Shown with the Plus mark and can't be picked. */
  isLocked?: boolean;
}

/** One choice out of a few, as a row of pills. */
export const Segmented = <T,>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label={label}
    className={classNames(
      'flex w-fit gap-0.5 rounded-10 bg-surface-float p-0.5',
      className,
    )}
  >
    {options.map((option) => {
      const isActive = option.value === value;
      const button = (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={isActive}
          aria-disabled={option.isLocked}
          onClick={() => !option.isLocked && onChange(option.value)}
          className={classNames(
            'flex h-7 items-center gap-1 rounded-8 px-2.5 font-bold typo-footnote transition-colors',
            isActive &&
              classNames(
                'bg-background-default shadow-2',
                option.activeClassName ?? 'text-text-primary',
              ),
            !isActive &&
              !option.isLocked &&
              'text-text-tertiary hover:text-text-primary',
            option.isLocked && 'cursor-default text-text-quaternary',
          )}
        >
          {option.isLocked && (
            <DevPlusIcon
              size={IconSize.Size16}
              className="text-action-plus-default"
            />
          )}
          {option.label}
        </button>
      );
      return option.description ? (
        <Tooltip key={option.label} content={option.description}>
          {button}
        </Tooltip>
      ) : (
        button
      );
    })}
  </div>
);

/** How long a change lasts: 3 days, a week, or until the viewer changes it. */
export const DurationPicker = ({
  value,
  onChange,
  label = 'How long',
  lockedValues = [],
}: {
  value: Duration;
  onChange: (duration: Duration) => void;
  label?: string;
  /** Durations shown with the Plus mark that can't be picked. */
  lockedValues?: Duration[];
}): ReactElement => (
  <div className="flex flex-col gap-1.5">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <Segmented
      label={label}
      value={value}
      options={durationOptions.map((option) => ({
        ...option,
        isLocked: lockedValues.includes(option.value),
        description: lockedValues.includes(option.value)
          ? `${option.label} is a Plus feature.`
          : undefined,
      }))}
      onChange={onChange}
    />
  </div>
);

/** A slider with its value beside it, for a topic or source boost. */
export const BoostSlider = ({
  label,
  value,
  min,
  max,
  step,
  display,
  isSet,
  resetLabel,
  onChange,
  onReset,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  /** The user set this value, so it no longer follows the feed. */
  isSet: boolean;
  resetLabel: string;
  onChange: (value: number) => void;
  onReset: () => void;
  className?: string;
}): ReactElement => (
  <span className={classNames('flex min-w-0 items-center gap-2', className)}>
    <Slider
      compact
      className="flex-1"
      min={min}
      max={max}
      step={step}
      value={[value]}
      thumbLabel={label}
      onValueChange={([next]) => onChange(next)}
    />
    <span
      className={classNames(
        'w-14 shrink-0 text-right tabular-nums typo-callout',
        isSet ? 'text-accent-cabbage-default' : 'text-text-secondary',
      )}
    >
      {display}
    </span>
    <Button
      type="button"
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<RefreshIcon />}
      aria-label={resetLabel}
      title={resetLabel}
      className={classNames('shrink-0', !isSet && 'invisible')}
      onClick={onReset}
    />
  </span>
);

/** A labelled slider for one ranking setting, with a reset once changed. */
export const ParamSlider = ({
  paramKey,
  isCompact,
  isLocked,
}: {
  paramKey: ParamKey;
  isCompact?: boolean;
  /** Shows the value without letting the viewer change it. */
  isLocked?: boolean;
}): ReactElement => {
  const { state, setParam, resetParam } = usePersonalization();
  const meta = getParamMeta(paramKey);
  const value = state.params[paramKey];
  const isDefault = value === defaultParams[paramKey];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 shrink font-bold text-text-primary typo-callout">
          {meta.label}
        </span>
        <span className="flex shrink-0 items-baseline gap-2">
          {!isDefault && (
            <button
              type="button"
              className="text-text-link typo-footnote hover:underline"
              onClick={() => resetParam(paramKey)}
            >
              Reset to {formatParam(meta.format, defaultParams[paramKey])}
            </button>
          )}
          <span
            className={classNames(
              'tabular-nums typo-callout',
              isDefault ? 'text-text-secondary' : 'text-accent-cabbage-default',
            )}
          >
            {formatParam(meta.format, value)}
          </span>
        </span>
      </div>
      <Slider
        compact
        className={classNames(isLocked && 'cursor-not-allowed opacity-40')}
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={[value]}
        thumbLabel={meta.label}
        disabled={isLocked}
        onValueChange={([next]) => setParam(paramKey, next)}
      />
      {!isCompact && (
        <span className="text-text-tertiary typo-footnote">{meta.help}</span>
      )}
    </div>
  );
};
