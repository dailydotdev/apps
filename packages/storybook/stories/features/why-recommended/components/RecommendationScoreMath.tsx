import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import type { RecommendationScoreFactor } from './whyRecommended';

interface RecommendationScoreMathProps {
  factors: RecommendationScoreFactor[];
  finalScore?: number;
  className?: string;
}

const formatScore = (value: number): string =>
  `${value < 0 ? '-' : '+'}${Math.abs(value).toFixed(3)}`;

interface ScoreBarProps {
  value: number;
  zero: number;
  span: number;
}

const ScoreBar = ({ value, zero, span }: ScoreBarProps): ReactElement => {
  const width = (Math.abs(value) / span) * 100;

  return (
    <span className="relative h-1 rounded-max bg-border-subtlest-tertiary">
      <span
        className={classNames(
          'absolute inset-y-0 rounded-max',
          value < 0 ? 'bg-accent-ketchup-default' : 'bg-accent-avocado-default',
        )}
        style={{
          left: `${value < 0 ? zero - width : zero}%`,
          width: `${width}%`,
          minWidth: '0.25rem',
        }}
      />
    </span>
  );
};

const rowClassName =
  'grid grid-cols-[minmax(0,10rem)_1fr_3.25rem] items-center gap-3 typo-footnote';

export const ScoreBreakdownToggle = ({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}): ReactElement => (
  <Button
    type="button"
    variant={ButtonVariant.Subtle}
    size={ButtonSize.XSmall}
    aria-expanded={isOpen}
    onClick={onToggle}
  >
    Score breakdown
    <ArrowIcon
      size={IconSize.Size16}
      className={classNames(
        'ml-1 transition-transform',
        isOpen ? 'rotate-0' : 'rotate-180',
      )}
    />
  </Button>
);

export const RecommendationScoreMath = ({
  factors,
  finalScore,
  className,
}: RecommendationScoreMathProps): ReactElement => {
  const values = [...factors.map(({ value }) => value), finalScore ?? 0];
  const maxNegative = Math.max(0, ...values.map((value) => -value));
  const maxPositive = Math.max(0, ...values);
  const span = maxNegative + maxPositive || 1;
  const zero = (maxNegative / span) * 100;

  return (
    <div className={classNames('flex flex-col gap-2', className)}>
      <ul className="flex flex-col gap-1.5">
        {factors.map(({ label, value }) => (
          <li key={label} className={rowClassName}>
            <span className="truncate text-text-secondary">{label}</span>
            <ScoreBar value={value} zero={zero} span={span} />
            <span className="text-right tabular-nums text-text-tertiary">
              {formatScore(value)}
            </span>
          </li>
        ))}
        {finalScore !== undefined && (
          <li
            className={classNames(
              rowClassName,
              'mt-1 border-t border-border-subtlest-tertiary pt-2 font-bold',
            )}
          >
            <span className="truncate text-text-primary">Final score</span>
            <ScoreBar value={finalScore} zero={zero} span={span} />
            <span className="text-right tabular-nums text-text-primary">
              {formatScore(finalScore)}
            </span>
          </li>
        )}
      </ul>
      <p className="text-text-quaternary typo-caption1">
        Green raised the rank, red lowered it.
      </p>
    </div>
  );
};
