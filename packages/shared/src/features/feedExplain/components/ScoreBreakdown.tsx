import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import type { ScoreBreakdownParts } from '../describe';

// Two decimals, or two digits for a tiny value so it never reads as 0.
const formatMultiplier = (value: number): string =>
  value >= 0.1 ? value.toFixed(2) : value.toPrecision(2);

interface ScoreBarProps {
  value: number;
  zero: number;
  span: number;
}

const ScoreBar = ({ value, zero, span }: ScoreBarProps): ReactElement => (
  <span className="relative h-1 rounded-max bg-border-subtlest-tertiary">
    <span
      className={classNames(
        'absolute inset-y-0 min-w-1 rounded-max',
        value < 0 ? 'bg-text-tertiary' : 'bg-accent-avocado-default',
      )}
      style={{
        ...(value < 0 ? { right: `${100 - zero}%` } : { left: `${zero}%` }),
        width: `${(Math.abs(value) / span) * 100}%`,
      }}
    />
  </span>
);

const rowClassName =
  'grid grid-cols-[minmax(0,10rem)_1fr_3.25rem] items-center gap-3 typo-footnote';

const FactorLabel = ({
  label,
  hint,
  className,
}: {
  label: string;
  hint: string;
  className?: string;
}): ReactElement => (
  <Tooltip
    content={<p className="shrink">{hint}</p>}
    side="top"
    enableMobileClick
  >
    <button
      type="button"
      className={classNames(
        'w-fit max-w-full cursor-help truncate text-left underline decoration-text-quaternary decoration-dotted underline-offset-4',
        className,
      )}
    >
      {label}
    </button>
  </Tooltip>
);

const scoreHint =
  'All the rows multiplied together. It only means something next to other posts: the higher the score, the higher the post shows up in your feed.';

interface ScoreBreakdownProps extends ScoreBreakdownParts {
  className?: string;
}

/**
 * Each factor that moved a card's score as a bar, on a log scale so a
 * halving is as long as a doubling, then the ones that didn't and the score.
 */
export const ScoreBreakdown = ({
  factors,
  unchanged,
  score,
  className,
}: ScoreBreakdownProps): ReactElement => {
  const values = factors.map(({ multiplier }) => Math.log(multiplier));
  const maxNegative = Math.max(0, ...values.map((value) => -value));
  const maxPositive = Math.max(0, ...values);
  const span = maxNegative + maxPositive || 1;
  const zero = (maxNegative / span) * 100;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      {factors.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {factors.map(({ label, hint, multiplier }, index) => (
            <li key={label} className={rowClassName}>
              <FactorLabel
                label={label}
                hint={hint}
                className="text-text-secondary"
              />
              <ScoreBar value={values[index]} zero={zero} span={span} />
              <span className="text-right tabular-nums text-text-tertiary">
                ×{formatMultiplier(multiplier)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {unchanged.length > 0 && (
        <p className="flex flex-wrap gap-x-1 text-text-tertiary typo-footnote">
          No effect:
          {unchanged.map(({ label, hint }, index) => (
            <span key={label}>
              <FactorLabel label={label} hint={hint} />
              {index < unchanged.length - 1 && ','}
            </span>
          ))}
        </p>
      )}
      <div
        className={classNames(
          rowClassName,
          'mt-1 border-t border-border-subtlest-tertiary pt-2 font-bold',
        )}
      >
        <FactorLabel
          label="Score"
          hint={scoreHint}
          className="text-text-primary"
        />
        <span />
        <span className="text-right tabular-nums text-text-primary">
          {formatMultiplier(score)}
        </span>
      </div>
      <p className="text-text-quaternary typo-caption1">
        The rows multiply into the score. Posts are ranked against each other,
        highest first.
      </p>
    </div>
  );
};
