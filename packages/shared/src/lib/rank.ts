export const NO_RANK = 'No rank';
export const FINAL_RANK = 'You made it 🎉';
export const STEPS_PER_RANK = [3, 4, 5, 6, 7];
export const RANK_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
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
export const RANKS = [
  {
    name: 'Starter',
    steps: 0,
    level: 1,
    color: 'red',
  },
  {
    name: 'Bronze',
    steps: 2,
    level: 2,
    color: 'red',
  },
  {
    name: 'Silver',
    steps: 3,
    level: 3,
    color: 'red',
  },
  {
    name: 'Gold',
    steps: 4,
    level: 4,
    color: 'red',
  },
  {
    name: 'Platinum',
    steps: 5,
    level: 5,
    color: 'red',
  },
  {
    name: 'Diamond',
    steps: 6,
    level: 6,
    color: 'red',
  },
  {
    name: 'Legendary',
    steps: 7,
    level: 7,
    color: 'red',
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
  if (finalRank && progress >= RANKS[nextRank - 1].steps) return FINAL_RANK;
  if (finalRank || (nextRank === rankLastWeek && progress < RANKS[rank].steps))
    return `Re-earn: ${progress}/${STEPS_PER_RANK[rank - 1]} days`;
  if (nextRank === 0) return `Earn: ${progress ?? 0}/3 days`;
  if (showNextLevel) return `Next level: ${RANK_NAMES[rank]}`;
  return `Earn: ${progress ?? 0}/${RANKS[rank].steps} days`;
};
