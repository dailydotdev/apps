// Reading streak milestone rewards. Mock data for the exploration.
//
// The streak ladder and the flame tier artwork come from the streak progression
// PR (#5613, feat/streak-progression-system). The PNGs are copied into the
// Storybook public folder, so everything here renders with the real assets.

export enum StreakTier {
  Ember = 'ember',
  Spark = 'spark',
  Kindle = 'kindle',
  Flame = 'flame',
  Blaze = 'blaze',
  Firestorm = 'firestorm',
  Inferno = 'inferno',
  Scorcher = 'scorcher',
  EternalFlame = 'eternal-flame',
  Supernova = 'supernova',
  Legendary = 'legendary',
  Phoenix = 'phoenix',
  Titan = 'titan',
  Godflame = 'godflame',
}

export const tierArt = (tier: StreakTier): string =>
  `/streak-tiers/${tier}.png`;

export const sponsoredGiftArt = '/streak-tiers/sponsored-gift.png';

/** The shattered flame from the streak progression PR (#5613). */
export const streakBrokenArt = '/streak-tiers/streak-recover-cover.png';

export interface StreakMilestone {
  day: number;
  tier: StreakTier;
  /** The tier name doubles as the thing you brag about. */
  label: string;
  /** What the day gives. First-party unless `sponsored` is set. */
  reward: string;
  /** Sponsored gift days. Deliberately rare, and never two in a row. */
  sponsored?: boolean;
  headline: string;
}

export const streakLadder: StreakMilestone[] = [
  {
    day: 3,
    tier: StreakTier.Spark,
    label: 'Spark',
    reward: '10 Cores',
    headline: 'Three days in a row',
  },
  {
    day: 5,
    tier: StreakTier.Kindle,
    label: 'Kindle',
    reward: '10 Cores',
    headline: 'Five days in a row',
  },
  {
    day: 7,
    tier: StreakTier.Flame,
    label: 'Flame',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'A full week, unbroken',
  },
  {
    day: 14,
    tier: StreakTier.Blaze,
    label: 'Blaze',
    reward: '48h post boost',
    headline: 'Two weeks straight',
  },
  {
    day: 21,
    tier: StreakTier.Firestorm,
    label: 'Firestorm',
    reward: '50 Cores',
    headline: 'Twenty one days',
  },
  {
    day: 30,
    tier: StreakTier.Inferno,
    label: 'Inferno',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'A full month, unbroken',
  },
  {
    day: 60,
    tier: StreakTier.Scorcher,
    label: 'Scorcher',
    reward: 'Mystery daily.dev prize',
    headline: 'Sixty days',
  },
  {
    day: 90,
    tier: StreakTier.EternalFlame,
    label: 'Eternal Flame',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'Ninety days',
  },
  {
    day: 180,
    tier: StreakTier.Supernova,
    label: 'Supernova',
    reward: 'Mystery daily.dev prize',
    headline: 'Half a year',
  },
  {
    day: 365,
    tier: StreakTier.Legendary,
    label: 'Legendary',
    reward: 'Sponsored gift',
    sponsored: true,
    headline: 'One year, every single day',
  },
];

export const milestoneByDay = (day: number): StreakMilestone =>
  streakLadder.find((milestone) => milestone.day === day) ?? streakLadder[0];

/** The three days used across the stories, so the examples stay comparable. */
export const milestones = {
  week: milestoneByDay(7),
  month: milestoneByDay(30),
  year: milestoneByDay(365),
};

/** The last seven days behind the current streak, for the day strip. */
export const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
