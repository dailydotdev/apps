import type { ReactNode } from 'react';
import classed from '../../../lib/classed';

export interface LeaderboardListContainerProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export const LeaderboardCard = classed(
  'div',
  'flex flex-col border-b border-border-subtlest-tertiary p-4 tablet:rounded-12 tablet:border tablet:bg-surface-float',
);
