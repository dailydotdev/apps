import type { KeyboardEvent, ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { FeedWidgetSize } from './types';
import { feedWidgetSizeLabel } from './types';

const radioKeySteps: Partial<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** Arrow keys move a size group's choice, and its focus, as radios do. */
const sizeFromKey = (
  event: KeyboardEvent<HTMLElement>,
  sizes: FeedWidgetSize[],
  size: FeedWidgetSize,
): FeedWidgetSize | undefined => {
  const step = radioKeySteps[event.key];
  if (!step) {
    return undefined;
  }
  event.preventDefault();
  const index = (sizes.indexOf(size) + step + sizes.length) % sizes.length;
  const radios =
    event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
      '[role="radio"]',
    );
  radios?.[index]?.focus();
  return sizes[index];
};

export const SizePicker = ({
  sizes,
  size,
  onChange,
}: {
  sizes: FeedWidgetSize[];
  size: FeedWidgetSize;
  onChange: (size: FeedWidgetSize) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Size"
    className="flex rounded-10 bg-surface-float p-0.5"
  >
    {sizes.map((value) => (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={size === value}
        tabIndex={size === value ? 0 : -1}
        onClick={() => onChange(value)}
        onKeyDown={(event) => {
          const next = sizeFromKey(event, sizes, size);
          if (next) {
            onChange(next);
          }
        }}
        className={classNames(
          'h-7 rounded-8 px-3 transition-colors typo-footnote',
          size === value
            ? 'bg-background-default font-bold text-text-primary shadow-2'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {feedWidgetSizeLabel[value]}
      </button>
    ))}
  </div>
);
