import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { Slider } from '@dailydotdev/shared/src/components/fields/Slider';
import type { ParamKey } from '../policy/params';
import { defaultParams, formatParam, getParamMeta } from '../policy/params';
import { usePersonalization } from './PersonalizationContext';

export const Strong = ({ children }: { children: ReactNode }): ReactElement => (
  <strong className="font-bold text-text-primary">{children}</strong>
);

export interface SegmentOption<T> {
  value: T;
  label: string;
  activeClassName?: string;
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
      return (
        <button
          key={option.label}
          type="button"
          role="radio"
          aria-checked={isActive}
          onClick={() => onChange(option.value)}
          className={classNames(
            'h-7 rounded-8 px-2.5 font-bold typo-footnote transition-colors',
            isActive
              ? classNames(
                  'bg-background-default shadow-2',
                  option.activeClassName ?? 'text-text-primary',
                )
              : 'text-text-tertiary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export const ToggleRow = ({
  id,
  label,
  description,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  description?: ReactNode;
  checked: boolean;
  onToggle: () => void;
}): ReactElement => (
  <div className="flex items-start justify-between gap-3">
    <span className="flex min-w-0 shrink flex-col gap-0.5">
      <label
        htmlFor={id}
        className="font-bold text-text-primary typo-callout"
      >
        {label}
      </label>
      {description && (
        <span className="text-text-tertiary typo-footnote">{description}</span>
      )}
    </span>
    <Switch
      inputId={id}
      name={id}
      checked={checked}
      onToggle={onToggle}
      aria-label={label}
    />
  </div>
);

/** A labelled slider for one policy knob, with its default and raw key. */
export const ParamSlider = ({
  paramKey,
  isCompact,
}: {
  paramKey: ParamKey;
  isCompact?: boolean;
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
        <span
          className={classNames(
            'shrink-0 tabular-nums typo-callout',
            isDefault ? 'text-text-secondary' : 'text-accent-cabbage-default',
          )}
        >
          {formatParam(meta.format, value)}
        </span>
      </div>
      <Slider
        compact
        min={meta.min}
        max={meta.max}
        step={meta.step}
        value={[value]}
        thumbLabel={meta.label}
        onValueChange={([next]) => setParam(paramKey, next)}
      />
      {!isCompact && (
        <span className="text-text-tertiary typo-footnote">{meta.help}</span>
      )}
      <span className="flex items-center justify-between gap-2 text-text-quaternary typo-caption1">
        <code className="min-w-0 shrink truncate">{paramKey}</code>
        {isDefault ? (
          <span className="shrink-0">Default</span>
        ) : (
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.XSmall}
            className="-my-1 shrink-0"
            onClick={() => resetParam(paramKey)}
          >
            Reset to {formatParam(meta.format, defaultParams[paramKey])}
          </Button>
        )}
      </span>
    </div>
  );
};
