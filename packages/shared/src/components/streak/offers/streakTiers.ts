// Streak tier ladder from the milestone-rewards design exploration (#6486),
// itself modeled on the streak progression system (#5613). Until that system
// ships, the popup derives the tier from the highest ladder step at or below
// the current streak.

export type StreakTierMilestone = {
  day: number;
  tier: string;
  label: string;
  headline: string;
};

const streakTierLadder: StreakTierMilestone[] = [
  { day: 3, tier: 'spark', label: 'Spark', headline: 'Three days in a row' },
  { day: 5, tier: 'kindle', label: 'Kindle', headline: 'Five days in a row' },
  { day: 7, tier: 'flame', label: 'Flame', headline: 'A full week, unbroken' },
  { day: 14, tier: 'blaze', label: 'Blaze', headline: 'Two weeks straight' },
  {
    day: 21,
    tier: 'firestorm',
    label: 'Firestorm',
    headline: 'Twenty one days',
  },
  {
    day: 30,
    tier: 'inferno',
    label: 'Inferno',
    headline: 'A full month, unbroken',
  },
  { day: 60, tier: 'scorcher', label: 'Scorcher', headline: 'Sixty days' },
  {
    day: 90,
    tier: 'eternal-flame',
    label: 'Eternal Flame',
    headline: 'Ninety days',
  },
  { day: 180, tier: 'supernova', label: 'Supernova', headline: 'Half a year' },
  {
    day: 365,
    tier: 'legendary',
    label: 'Legendary',
    headline: 'One year, every single day',
  },
];

export const milestoneForStreak = (day: number): StreakTierMilestone => {
  const reached = streakTierLadder.filter((milestone) => milestone.day <= day);

  return reached[reached.length - 1] ?? streakTierLadder[0];
};

export const streakTierArt = (tier: string): string =>
  `https://media.daily.dev/image/upload/f_auto,q_auto/public/streak-tier-${tier}`;

export const streakWeekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
