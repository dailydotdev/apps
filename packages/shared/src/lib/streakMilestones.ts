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

// Flip this back to `true` when the sponsored streak reward should return.
export const SHOW_SPONSORED_STREAK_MILESTONE = false;
export const SPONSORED_STREAK_MILESTONE_DAY = 4;
export const SPONSORED_STREAK_COUPON_CODE = 'CURSOR-4D-STREAK';

const PRE_SPONSORED_STREAK_MILESTONES: StreakMilestone[] = [
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
    rewards: [{ type: RewardType.Cores, description: '10 Cores' }],
  },
];

const SPONSORED_STREAK_MILESTONE: StreakMilestone = {
  day: SPONSORED_STREAK_MILESTONE_DAY,
  tier: StreakTier.Spark,
  label: 'Cursor AI',
  rewards: [{ type: RewardType.Perk, description: '20% discount coupon' }],
};

const POST_SPONSORED_STREAK_MILESTONES: StreakMilestone[] = [
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
    rewards: [{ type: RewardType.Cores, description: '25 Cores' }],
  },
  {
    day: 14,
    tier: StreakTier.Blaze,
    label: 'Blaze',
    rewards: [{ type: RewardType.Perk, description: '48H Boost post' }],
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
      {
        type: RewardType.Perk,
        description: 'X1 free streak restore',
      },
    ],
  },
  {
    day: 90,
    tier: StreakTier.EternalFlame,
    label: 'Eternal Flame',
    rewards: [{ type: RewardType.Cores, description: '250 Cores' }],
  },
  {
    day: 180,
    tier: StreakTier.Supernova,
    label: 'Supernova',
    rewards: [{ type: RewardType.Perk, description: 'Verified Reader title' }],
  },
  {
    day: 365,
    tier: StreakTier.Legendary,
    label: 'Legendary',
    rewards: [{ type: RewardType.Cores, description: '600 Cores' }],
  },
  {
    day: 730,
    tier: StreakTier.Phoenix,
    label: 'Phoenix',
    rewards: [{ type: RewardType.Cores, description: '900 Cores' }],
  },
  {
    day: 1095,
    tier: StreakTier.Titan,
    label: 'Titan',
    rewards: [{ type: RewardType.Perk, description: 'Top comment (Shotgun!)' }],
  },
  {
    day: 1460,
    tier: StreakTier.Godflame,
    label: 'Godflame',
    rewards: [
      { type: RewardType.Cosmetic, description: 'Goldflame crown badge' },
    ],
  },
];

export const STREAK_MILESTONES: StreakMilestone[] = [
  ...PRE_SPONSORED_STREAK_MILESTONES,
  ...(SHOW_SPONSORED_STREAK_MILESTONE ? [SPONSORED_STREAK_MILESTONE] : []),
  ...POST_SPONSORED_STREAK_MILESTONES,
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
