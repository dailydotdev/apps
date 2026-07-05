import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface GivebackMeterShineProps {
  percentage: number;
  /** Match the meter's corner radius so the sweep stays inside the bar. */
  radiusClassName?: string;
}

// Light sweep that rides across the filled portion of a funding meter, making
// the money raised feel alive. Clipped to `percentage` so the shine only
// travels over what's already been pledged.
export const GivebackMeterShine = ({
  percentage,
  radiusClassName = 'rounded-16',
}: GivebackMeterShineProps): ReactElement => (
  <div
    aria-hidden
    className={classNames(
      'pointer-events-none absolute inset-y-0 left-0 overflow-hidden',
      radiusClassName,
    )}
    style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
  >
    <div className="via-white/55 absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent to-transparent motion-safe:animate-meter-shine" />
  </div>
);
