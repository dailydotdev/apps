import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { startupsLavenderInk } from '../../../styles/custom';

/**
 * Marks what a company page gets without paying, in the green the plan pages
 * use for money a page gets back.
 */
export const StartupsFreeChip = ({
  label = 'Free',
  className,
}: {
  label?: string;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'rounded-6 bg-accent-avocado-default px-1.5 py-0.5 font-bold uppercase typo-caption1',
      className,
    )}
    style={{ color: startupsLavenderInk }}
  >
    {label}
  </span>
);
