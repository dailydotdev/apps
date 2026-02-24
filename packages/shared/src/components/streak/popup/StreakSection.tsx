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
  return (
    <span className="flex flex-1 flex-col">
      <strong
        className={
          isPrimary
            ? 'text-[5rem] leading-[0.85] tablet:text-[5.5rem]'
            : 'typo-title3 leading-none'
        }
      >
        {streak}
      </strong>
      <p className="py-1 text-text-quaternary typo-subhead">{label}</p>
    </span>
  );
}
