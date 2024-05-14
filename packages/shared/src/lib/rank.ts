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
    name: 'Iron',
    steps: 1,
    level: 1,
    background: 'bg-border-subtlest-primary',
    border: 'border-border-subtlest-primary',
    color: 'text-text-tertiary',
  },
  {
    name: 'Bronze',
    steps: 2,
    level: 2,
    background: 'bg-accent-burger-default',
    border: 'border-accent-burger-default',
    color: 'text-accent-burger-default',
  },
  {
    name: 'Silver',
    steps: 3,
    level: 3,
    background: 'bg-accent-salt-default',
    border: 'border-accent-salt-default',
    color: 'text-accent-salt-default',
  },
  {
    name: 'Gold',
    steps: 4,
    level: 4,
    background: 'bg-accent-cheese-default',
    border: 'border-accent-cheese-default',
    color: 'text-accent-cheese-default',
  },
  {
    name: 'Platinum',
    steps: 5,
    level: 5,
    background: 'bg-accent-blueCheese-default',
    border: 'border-accent-blueCheese-default',
    color: 'text-accent-blueCheese-default',
  },
  {
    name: 'Diamond',
    steps: 6,
    level: 6,
    background: 'bg-accent-cabbage-default',
    border: 'border-accent-cabbage-default',
    color: 'text-brand-default',
  },
  {
    name: 'Legendary',
    steps: 7,
    level: 7,
    background: 'bg-accent-bacon-default',
    border: 'border-accent-bacon-default',
    color: 'text-accent-bacon-default',
  },
];

export const getRank = (rank = 0): number => {
  const computedRank = rank ? Math.max(0, rank - 1) : 0;

  if (computedRank >= RANKS.length) {
    return RANKS.length - 1;
  }

  return computedRank;
};
