import type { ReactElement } from 'react';
import React from 'react';

interface StreakSectionProps {
  streak: number;
  label: string;
  isPrimary?: boolean;
}

export function StreakSection({
  streak,
  label,
  isPrimary,
}: StreakSectionProps): ReactElement {
  const displayLabel = isPrimary ? `Current streak · ${label}` : label;

  return (
    <span className="flex flex-1 flex-col">
      <strong
        className={
          isPrimary
            ? 'text-[4rem] leading-[0.9] tablet:text-[4.5rem]'
            : 'typo-title3 leading-none'
        }
      >
        {streak}
      </strong>
      <p className="py-1 text-text-quaternary typo-subhead">{displayLabel}</p>
    </span>
  );
}
