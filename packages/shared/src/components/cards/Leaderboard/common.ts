import type { ReactNode } from 'react';
import classed from '../../../lib/classed';

export interface LeaderboardListContainerProps {
  title: string;
  titleHref?: string;
  children: ReactNode;
  className?: string;
}

export const LeaderboardCard = classed(
  'div',
  'flex flex-col border-b border-border-subtlest-tertiary p-4 tablet:rounded-12 tablet:border tablet:bg-surface-float',
);

export const indexToEmoji = (index: number): string => {
  switch (index) {
    case 0:
      return '🏆';
    case 1:
      return '🥈';
    case 2:
      return '🥉';
    default:
      return '';
  }
};
