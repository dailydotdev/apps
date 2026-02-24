export enum StreakTier {
  Ember = 'ember',
  Spark = 'spark',
  Kindle = 'kindle',
  Flame = 'flame',
  Blaze = 'blaze',
  Firestorm = 'firestorm',
  Inferno = 'inferno',
  Scorcher = 'scorcher',
  EternalFlame = 'eternal_flame',
  Supernova = 'supernova',
  Legendary = 'legendary',
  Phoenix = 'phoenix',
  Titan = 'titan',
  Godflame = 'godflame',
}

export enum RewardType {
  Cores = 'cores',
  Cosmetic = 'cosmetic',
  Perk = 'perk',
}

export interface StreakReward {
  type: RewardType;
  description: string;
}

export interface StreakMilestone {
  day: number;
  tier: StreakTier;
  label: string;
  rewards: StreakReward[];
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    day: 1,
    tier: StreakTier.Ember,
    label: 'Ember',
    rewards: [],
  },
  {
    day: 3,
    tier: StreakTier.Spark,
    label: 'Spark',
    rewards: [
      { type: RewardType.Cosmetic, description: 'Streak badge on profile' },
    ],
  },
  {
    day: 5,
    tier: StreakTier.Kindle,
    label: 'Kindle',
    rewards: [{ type: RewardType.Cores, description: '10 Cores' }],
  },
  {
    day: 7,
    tier: StreakTier.Flame,
    label: 'Flame',
    rewards: [
      { type: RewardType.Cores, description: '25 Cores' },
      { type: RewardType.Cosmetic, description: 'Active Reader flair' },
    ],
  },
  {
    day: 14,
    tier: StreakTier.Blaze,
    label: 'Blaze',
    rewards: [
      { type: RewardType.Cosmetic, description: 'Streak on DevCard' },
      { type: RewardType.Perk, description: 'Boosted post visibility 24h' },
    ],
  },
  {
    day: 21,
    tier: StreakTier.Firestorm,
    label: 'Firestorm',
    rewards: [{ type: RewardType.Cores, description: '50 Cores' }],
  },
  {
    day: 30,
    tier: StreakTier.Inferno,
    label: 'Inferno',
    rewards: [
      { type: RewardType.Cores, description: '100 Cores' },
      { type: RewardType.Cosmetic, description: 'Exclusive profile frame' },
    ],
  },
  {
    day: 60,
    tier: StreakTier.Scorcher,
    label: 'Scorcher',
    rewards: [
      { type: RewardType.Cosmetic, description: 'Enhanced DevCard skin' },
      {
        type: RewardType.Perk,
        description: 'Priority source recommendations 7d',
      },
    ],
  },
  {
    day: 90,
    tier: StreakTier.EternalFlame,
    label: 'Eternal Flame',
    rewards: [
      { type: RewardType.Cores, description: '200 Cores' },
      { type: RewardType.Cosmetic, description: 'Animated profile badge' },
    ],
  },
  {
    day: 180,
    tier: StreakTier.Supernova,
    label: 'Supernova',
    rewards: [
      { type: RewardType.Cores, description: '300 Cores' },
      {
        type: RewardType.Perk,
        description: 'Dedicated Reader verified badge',
      },
    ],
  },
  {
    day: 365,
    tier: StreakTier.Legendary,
    label: 'Legendary',
    rewards: [
      { type: RewardType.Cores, description: '500 Cores' },
      {
        type: RewardType.Cosmetic,
        description: 'Unique animated DevCard background',
      },
      {
        type: RewardType.Cosmetic,
        description: 'Permanent Legendary badge',
      },
    ],
  },
  {
    day: 730,
    tier: StreakTier.Phoenix,
    label: 'Phoenix',
    rewards: [
      { type: RewardType.Cores, description: '750 Cores' },
      {
        type: RewardType.Cosmetic,
        description: 'Phoenix rising DevCard animation',
      },
      { type: RewardType.Perk, description: 'Custom profile color theme' },
    ],
  },
  {
    day: 1095,
    tier: StreakTier.Titan,
    label: 'Titan',
    rewards: [
      { type: RewardType.Cores, description: '1000 Cores' },
      {
        type: RewardType.Cosmetic,
        description: 'Titan holographic DevCard effect',
      },
      { type: RewardType.Perk, description: 'Permanent boosted visibility' },
    ],
  },
  {
    day: 1460,
    tier: StreakTier.Godflame,
    label: 'Godflame',
    rewards: [
      { type: RewardType.Cores, description: '1500 Cores' },
      {
        type: RewardType.Cosmetic,
        description: 'Godflame evolving DevCard aura',
      },
      {
        type: RewardType.Cosmetic,
        description: 'Permanent Godflame crown badge',
      },
      { type: RewardType.Perk, description: 'Founding Reader legacy title' },
    ],
  },
];

export const getCurrentTier = (currentStreak: number): StreakMilestone => {
  const reached = STREAK_MILESTONES.filter((m) => currentStreak >= m.day);
  return reached[reached.length - 1] ?? STREAK_MILESTONES[0];
};

export const getNextMilestone = (
  currentStreak: number,
): StreakMilestone | null => {
  return STREAK_MILESTONES.find((m) => m.day > currentStreak) ?? null;
};

export const getMilestoneAtDay = (day: number): StreakMilestone | null => {
  return STREAK_MILESTONES.find((m) => m.day === day) ?? null;
};

export const getTierProgress = (currentStreak: number): number => {
  const current = getCurrentTier(currentStreak);
  const next = getNextMilestone(currentStreak);

  if (!next) {
    return 100;
  }

  const rangeStart = current.day;
  const rangeEnd = next.day;
  const progress =
    ((currentStreak - rangeStart) / (rangeEnd - rangeStart)) * 100;

  return Math.min(Math.max(progress, 0), 100);
};
