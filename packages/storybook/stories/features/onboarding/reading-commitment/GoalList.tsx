import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { MinutesOption } from './PostStack';

/** How the goal list marks where top developers are. */
export type GoalHint = 'chip' | 'avatars' | 'tab' | 'bar';

export const GOAL_HINTS: Array<{ value: GoalHint; label: string }> = [
  { value: 'chip', label: 'A. Most common chip' },
  { value: 'avatars', label: 'B. Top developers’ faces' },
  { value: 'tab', label: 'C. Tab on the row' },
  { value: 'bar', label: 'D. Share of top developers' },
];

/**
 * Placeholder data: no numbers back these yet. The goal top developers pick
 * most, and how their picks spread across the goals, for the bars.
 */
export const TOP_GOAL = '15';
const TOP_SHARE: Record<string, number> = {
  '5': 18,
  '10': 30,
  '15': 40,
  '30': 12,
};

const AVATARS = [
  'https://avatars.githubusercontent.com/u/1366138?v=4',
  'https://avatars.githubusercontent.com/u/1454517?v=4',
  'https://avatars.githubusercontent.com/u/1553055?v=4',
];

const Avatars = (): ReactElement => (
  <span className="flex items-center gap-1.5">
    <span className="flex">
      {AVATARS.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={classNames(
            'size-5 max-w-none rounded-full border-2 border-background-default',
            index > 0 && '-ml-1.5',
          )}
        />
      ))}
    </span>
    <span className="font-bold text-text-secondary typo-caption1">
      Top devs
    </span>
  </span>
);

/**
 * The goal picker: the same quiz rows as the first screen's list, with room
 * for a mark on the goal top developers pick. Nothing is picked to start.
 */
export const GoalList = ({
  options,
  value,
  onChange,
  hint,
}: {
  options: MinutesOption[];
  value?: string;
  onChange: (value: string) => void;
  hint: GoalHint;
}): ReactElement => {
  const topShare = Math.max(...Object.values(TOP_SHARE));

  return (
    <div className="flex w-full flex-col gap-2">
      <div
        role="radiogroup"
        aria-label="Your daily goal"
        className={classNames(
          'grid grid-cols-1',
          // The tab sits on the row's top edge, so rows need room for it.
          hint === 'tab' ? 'gap-3 pt-2' : 'gap-2',
        )}
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const isTop = option.value === TOP_GOAL;

          return (
            <Button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${option.label}, ${option.hint}${
                isTop ? ', most common among top developers' : ''
              }`}
              pressed={isSelected}
              variant={ButtonVariant.Quiz}
              size={ButtonSize.XLarge}
              onClick={() => onChange(option.value)}
              className="relative !h-auto overflow-visible typo-body"
            >
              {hint === 'bar' && (
                // A thin meter along the row's bottom edge, so the selection
                // still reads first.
                <span
                  aria-hidden
                  className="absolute inset-x-4 bottom-1.5 h-1 overflow-hidden rounded-max bg-border-subtlest-tertiary"
                >
                  <span
                    className={classNames(
                      'block h-full rounded-max transition-[width] duration-500',
                      isTop
                        ? 'bg-accent-cabbage-default'
                        : 'bg-text-quaternary',
                    )}
                    style={{
                      width: `${(TOP_SHARE[option.value] / topShare) * 100}%`,
                    }}
                  />
                </span>
              )}
              {hint === 'tab' && isTop && (
                <span className="absolute -top-2.5 right-4 rounded-max bg-accent-cabbage-default px-2 py-0.5 font-bold text-white typo-caption2">
                  Top developers pick this
                </span>
              )}
              <span className="relative flex min-h-12 flex-1 items-center gap-2 text-left">
                <span className="flex-1 py-1">{option.label}</span>
                {hint === 'chip' && isTop && (
                  <span className="shrink-0 rounded-max bg-accent-cabbage-flat px-2 py-0.5 font-bold text-accent-cabbage-default typo-caption1">
                    Most common
                  </span>
                )}
                {hint === 'avatars' && isTop && <Avatars />}
                <span className="shrink-0 text-text-tertiary typo-callout">
                  {option.hint}
                </span>
              </span>
            </Button>
          );
        })}
      </div>
      {hint === 'bar' && (
        <p className="text-center text-text-tertiary typo-caption1">
          Bars show how many top developers pick each goal
        </p>
      )}
    </div>
  );
};
