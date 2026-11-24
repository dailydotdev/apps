import type { ReactElement } from 'react';
import React, { useId } from 'react';
import classNames from 'classnames';
import { startupsLavender } from '../../../styles/custom';

const Legend = ({
  label,
  isMore,
}: {
  label: string;
  isMore?: boolean;
}): ReactElement => (
  <span className="flex items-center gap-1.5">
    <span
      className={classNames(
        'w-3 border-t-2',
        !isMore && 'border-dashed border-text-quaternary',
      )}
      style={isMore ? { borderColor: startupsLavender } : undefined}
    />
    {label}
  </span>
);

// One lift that levels off, as a single boost does, or growth that builds on
// itself month after month
const curves = {
  lift: 'M0 50 C40 46 70 30 100 16 S150 5 176 3',
  compound: 'M0 50 C64 49 124 42 176 3',
};

/**
 * A sketch, not data: reach climbing with something daily.dev for Startups
 * adds, next to reach without it.
 */
export const StartupsReachChart = ({
  moreLabel,
  lessLabel,
  curve = 'lift',
  className,
}: {
  moreLabel: string;
  lessLabel: string;
  curve?: keyof typeof curves;
  className?: string;
}): ReactElement => {
  const id = useId();
  const path = curves[curve];

  return (
    <figure className={classNames('flex flex-col gap-1.5', className)}>
      <svg
        viewBox="0 0 176 56"
        preserveAspectRatio="none"
        className="h-14 w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={startupsLavender} stopOpacity=".4" />
            <stop offset="1" stopColor={startupsLavender} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L176 56 L0 56 Z`} fill={`url(#${id})`} />
        <path
          d={path}
          fill="none"
          stroke={startupsLavender}
          strokeWidth="2.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M0 50 C50 46 110 34 176 28"
          fill="none"
          className="stroke-text-quaternary"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="flex justify-between gap-2 text-text-tertiary typo-caption2">
        <Legend label={moreLabel} isMore />
        <Legend label={lessLabel} />
      </figcaption>
    </figure>
  );
};
