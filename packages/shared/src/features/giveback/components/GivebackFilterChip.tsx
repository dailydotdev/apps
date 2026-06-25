import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface GivebackFilterChipProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}

// Tag-style pill for the category filters. Every chip carries a visible border
// and surface so the row reads clearly as a set of filters/tags (not loose
// text); the active one fills with the brand color so the current filter is
// unmistakable.
export const GivebackFilterChip = ({
  isSelected,
  label,
  onClick,
}: GivebackFilterChipProps): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    className={classNames(
      'h-8 shrink-0 rounded-10 border px-3.5 font-bold transition-colors typo-footnote',
      isSelected
        ? 'border-accent-cabbage-default bg-accent-cabbage-default text-white'
        : 'border-border-subtlest-tertiary bg-surface-float text-text-secondary hover:border-accent-cabbage-default hover:text-text-primary',
    )}
    onClick={onClick}
  >
    {label}
  </button>
);
