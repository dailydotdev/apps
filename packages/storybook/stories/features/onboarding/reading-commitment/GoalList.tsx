import type { ReactElement } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { MinutesOption } from './PostStack';

/** The goal top developers pick most. Placeholder: no data backs it yet. */
export const TOP_GOAL = '15';

/**
 * The goal picker: the same quiz rows as the first screen's list, with a tab
 * on the goal top developers pick. Nothing is picked to start.
 */
export const GoalList = ({
  options,
  value,
  onChange,
}: {
  options: MinutesOption[];
  value?: string;
  onChange: (value: string) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Your daily goal"
    // The tab sits on the row's top edge, so rows need room for it.
    className="grid w-full grid-cols-1 gap-3 pt-2"
  >
    {options.map((option) => {
      const isTop = option.value === TOP_GOAL;

      return (
        <Button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={`${option.label}, ${option.hint}${
            isTop ? ', top developers pick this' : ''
          }`}
          pressed={option.value === value}
          variant={ButtonVariant.Quiz}
          size={ButtonSize.XLarge}
          onClick={() => onChange(option.value)}
          className="relative !h-auto overflow-visible typo-body"
        >
          {isTop && (
            <span className="absolute -top-2.5 right-4 rounded-max bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption2">
              Top developers pick this
            </span>
          )}
          <span className="flex min-h-12 flex-1 items-center gap-2 text-left">
            <span className="flex-1 py-1">{option.label}</span>
            <span className="shrink-0 text-text-tertiary typo-callout">
              {option.hint}
            </span>
          </span>
        </Button>
      );
    })}
  </div>
);
