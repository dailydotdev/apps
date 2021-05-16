export const STEPS_PER_RANK = [3, 4, 5, 6, 7];
export const RANK_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

const colorOrDefault = (rank: number, color: string): string =>
  rank > 0 ? color : 'var(--theme-label-tertiary)';

export const rankToColor = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color)`);
export const rankToGradientStopBottom = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color-bottom)`);
export const rankToGradientStopTop = (rank: number): string =>
  colorOrDefault(rank, `var(--theme-rank-${rank}-color-top)`);
