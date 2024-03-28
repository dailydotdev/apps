import React, { ReactElement } from 'react';

interface StreakSectionProps {
  streak: number;
  label: string;
}

export function StreakSection({
  streak,
  label,
}: StreakSectionProps): ReactElement {
  return (
    <span className="flex flex-1 flex-col">
      <strong className="typo-title3">{streak}</strong>
      <p className="text-text-quaternary typo-subhead">{label}</p>
    </span>
  );
}
