import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../../components/tooltip/Tooltip';

export interface SegmentOption<T> {
  value: T;
  label: string;
  /** What picking it does, or why it can't be picked. */
  description?: string;
  /** Dimmed and can't be picked: a Plus option for a free reader. */
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
            'flex h-7 items-center rounded-8 px-2.5 font-bold typo-footnote transition-colors',
            isActive && 'bg-background-default text-text-primary shadow-2',
            !isActive &&
              !option.isLocked &&
              'text-text-tertiary hover:text-text-primary',
            option.isLocked && 'cursor-default text-text-quaternary',
          )}
        >
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
