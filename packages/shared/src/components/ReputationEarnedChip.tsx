import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ReputationEarnedChipProps {
  amount: number;
  /** Adds the word, for places that don't already say it. */
  withLabel?: boolean;
  className?: string;
}

/** Reputation something earned, as a chip. Nothing for 0 or less. */
export const ReputationEarnedChip = ({
  amount,
  withLabel,
  className,
}: ReputationEarnedChipProps): ReactElement | null => {
  if (!(amount > 0)) {
    return null;
  }

  return (
    <span
      className={classNames(
        'inline-flex items-center whitespace-nowrap rounded-6 bg-accent-onion-flat px-1 font-bold tabular-nums text-accent-onion-default typo-caption2',
        className,
      )}
    >
      +{amount.toLocaleString('en-US')}
      {withLabel && ' reputation'}
    </span>
  );
};
