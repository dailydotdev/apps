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
      <h3 className="typo-title3 mb-2 font-bold">{title}</h3>
      <ol className="typo-body">{children}</ol>
    </LeaderboardCard>
  );
}
