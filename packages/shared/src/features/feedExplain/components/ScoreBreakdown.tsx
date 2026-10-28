import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import type { ScoreFactor } from '../describe';

const formatScore = (value: number): string =>
  `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(3)}`;

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
        value < 0 ? 'bg-accent-ketchup-default' : 'bg-accent-avocado-default',
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
  className: string;
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

const finalScoreHint =
  'All the rows added up. Posts with higher scores show up higher in your feed.';

interface ScoreBreakdownProps {
  factors: ScoreFactor[];
  finalScore: number;
  className?: string;
}

/** Each factor of a card's score as a bar from zero, then their sum. */
export const ScoreBreakdown = ({
  factors,
  finalScore,
  className,
}: ScoreBreakdownProps): ReactElement => {
  const values = [...factors.map(({ value }) => value), finalScore];
  const maxNegative = Math.max(0, ...values.map((value) => -value));
  const maxPositive = Math.max(0, ...values);
  const span = maxNegative + maxPositive || 1;
  const zero = (maxNegative / span) * 100;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <ul className="flex flex-col gap-1.5">
        {factors.map(({ label, hint, value }) => (
          <li key={label} className={rowClassName}>
            <FactorLabel
              label={label}
              hint={hint}
              className="text-text-secondary"
            />
            <ScoreBar value={value} zero={zero} span={span} />
            <span className="text-right tabular-nums text-text-tertiary">
              {formatScore(value)}
            </span>
          </li>
        ))}
        <li
          className={classNames(
            rowClassName,
            'mt-1 border-t border-border-subtlest-tertiary pt-2 font-bold',
          )}
        >
          <FactorLabel
            label="Final score"
            hint={finalScoreHint}
            className="text-text-primary"
          />
          <ScoreBar value={finalScore} zero={zero} span={span} />
          <span className="text-right tabular-nums text-text-primary">
            {formatScore(finalScore)}
          </span>
        </li>
      </ul>
      <p className="text-text-quaternary typo-caption1">
        Green raised the rank, red lowered it.
      </p>
    </div>
  );
};
