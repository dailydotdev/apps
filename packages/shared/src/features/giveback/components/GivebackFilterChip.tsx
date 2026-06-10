import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

interface GivebackFilterChipProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}

// Pill used for the cause-picker category filters.
export const GivebackFilterChip = ({
  isSelected,
  label,
  onClick,
}: GivebackFilterChipProps): ReactElement => (
  <button
    type="button"
    aria-pressed={isSelected}
    className={classNames(
      'h-8 shrink-0 rounded-10 px-3 font-medium transition-colors typo-footnote',
      isSelected
        ? 'bg-accent-cabbage-default text-white'
        : 'bg-transparent text-text-tertiary hover:bg-surface-float hover:text-text-primary',
    )}
    onClick={onClick}
  >
    {label}
  </button>
);
