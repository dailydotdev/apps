import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface ArenaSentimentBarProps {
  value: number;
}

const getSentimentColor = (value: number): string => {
  if (value > 60) {
    return 'bg-accent-avocado-default';
  }
  if (value >= 40) {
    return 'bg-accent-cheese-default';
  }
  return 'bg-accent-ketchup-default';
};

const getSentimentTextColor = (value: number): string => {
  if (value > 60) {
    return 'text-accent-avocado-default';
  }
  if (value >= 40) {
    return 'text-accent-cheese-default';
  }
  return 'text-accent-ketchup-default';
};

export const ArenaSentimentBar = ({
  value,
}: ArenaSentimentBarProps): ReactElement => (
  <div className="flex items-center gap-2">
    <div className="h-1.5 w-16 overflow-hidden rounded-4 bg-surface-float">
      <div
        className={classNames(
          'h-full rounded-4 transition-all duration-500',
          getSentimentColor(value),
        )}
        style={{ width: `${value}%` }}
      />
    </div>
    <span
      className={classNames(
        'font-bold typo-caption1',
        getSentimentTextColor(value),
      )}
    >
      {value}
    </span>
  </div>
);
