import type { ReactElement } from 'react';
import React from 'react';
import type { LeaderboardListContainerProps } from './common';
import { LeaderboardCard } from './common';

export function LeaderboardListContainer({
  children,
  className,
  title,
}: LeaderboardListContainerProps): ReactElement {
  return (
    <LeaderboardCard className={className}>
      <h3 className="mb-2 font-bold typo-title3">{title}</h3>
      <ol className="typo-body">{children}</ol>
    </LeaderboardCard>
  );
}
