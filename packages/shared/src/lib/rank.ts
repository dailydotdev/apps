export const NO_RANK = 'No rank';
export const FINAL_RANK = 'You made it 🎉';
export const RANK_OFFSET = [
  '37.5%',
  '37.5%',
  '12.5%',
  '-12.5%',
  '-37.5%',
  '-62.5%',
  '-87.5%',
  '-112.5%',
];
export interface Rank {
  name: string;
  steps: number;
  level: number;
  background: string;
  border: string;
  color: string;
}
export const RANKS: Rank[] = [
  {
    name: 'Starter',
    steps: 1,
    level: 1,
    background: 'bg-theme-status-success',
    border: 'border-theme-status-success',
    color: 'text-theme-status-success',
  },
  {
    name: 'Bronze',
    steps: 2,
    level: 2,
    background: 'bg-theme-color-burger',
    border: 'border-theme-color-burger',
    color: 'text-theme-color-burger',
  },
  {
    name: 'Silver',
    steps: 3,
    level: 3,
    background: 'bg-theme-label-tertiary',
    border: 'border-theme-border-tertiary',
    color: 'text-theme-label-tertiary',
  },
  {
    name: 'Gold',
    steps: 4,
    level: 4,
    background: 'bg-theme-color-cheese',
    border: 'border-theme-color-cheese',
    color: 'text-theme-color-cheese',
  },
  {
    name: 'Platinum',
    steps: 5,
    level: 5,
    background: 'bg-theme-color-blueCheese',
    border: 'border-theme-color-blueCheese',
    color: 'text-theme-color-blueCheese',
  },
  {
    name: 'Diamond',
    steps: 6,
    level: 6,
    background: 'bg-theme-color-cabbage',
    border: 'border-theme-color-cabbage',
    color: 'text-theme-color-cabbage',
  },
  {
    name: 'Legendary',
    steps: 7,
    level: 7,
    background: 'bg-theme-color-ketchup',
    border: 'border-theme-color-ketchup',
    color: 'text-theme-color-ketchup',
  },
];

const colorOrDefault = (rank: number, color: string): string =>
  rank > 0 ? color : 'var(--theme-label-tertiary)';

export const rankToColor = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color)`);
export const rankToGradientStopBottom = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color-bottom)`);
export const rankToGradientStopTop = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color-top)`);

interface GetNextRankTextProps {
  nextRank: number;
  rank: number;
  finalRank: boolean;
  progress: number;
  rankLastWeek?: number;
  showNextLevel?: boolean;
}
export const getNextRankText = ({
  nextRank,
  rank = 0,
  finalRank,
  progress,
  rankLastWeek,
  showNextLevel = true,
}: GetNextRankTextProps): string => {
  if (finalRank && progress >= RANKS[rank - 1].steps) return FINAL_RANK;
  if (finalRank || (nextRank === rankLastWeek && progress < RANKS[rank].steps))
    return `Re-earn: ${progress}/${RANKS[rank].steps} days`;
  if (nextRank === 0) return `Earn: ${progress ?? 0}/1 days`;
  if (showNextLevel) return `Next level: ${RANKS[rank].name}`;
  return `Earn: ${progress ?? 0}/${RANKS[rank].steps} days`;
};

export const isFinalRank = (rank: number): boolean => rank === RANKS.length;
export const isFinalRankCompleted = (rank: number, progress: number): boolean =>
  isFinalRank(rank) && progress === RANKS[rank - 1].steps;
export const getShowRank = (
  finalRank: boolean,
  rank: number,
  progress: number,
): number => {
  if (
    (finalRank && progress === RANKS[rank - 1].steps) ||
    progress >= RANKS[rank].steps
  ) {
    return rank;
  }

  return rank + 1;
};
export const isRankCompleted = (
  currentRank: number,
  checkRank: number,
  progress: number,
): boolean => {
  return (
    currentRank > checkRank ||
    (currentRank === RANKS.length && progress === RANKS[currentRank - 1].steps)
  );
};
