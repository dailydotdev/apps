import type {
  GivebackCampaign,
  GivebackLevel,
  GivebackUserProfile,
} from './types';
import {
  GivebackCampaignStatus,
  GivebackRewardStatus,
  GivebackRewardType,
} from './types';

// Phase 1 mock data. This is the single source of truth the baseline page renders
// from, and the dev review toggle drives it. Replaced by live queries in a later phase.

export const GIVEBACK_CURRENCY = 'USD';

export const givebackLevels: GivebackLevel[] = [
  {
    id: 'level-1',
    levelNumber: 1,
    name: 'First spark',
    requiredApprovedAmount: 0,
  },
  {
    id: 'level-2',
    levelNumber: 2,
    name: 'Helping hand',
    requiredApprovedAmount: 50,
  },
  {
    id: 'level-3',
    levelNumber: 3,
    name: 'Changemaker',
    requiredApprovedAmount: 150,
    reward: {
      id: 'reward-plus',
      type: GivebackRewardType.DailyPlus,
      title: '1 month of daily.dev Plus',
      secretTitle: 'Mystery reward',
      description: 'A little thank-you for moving the community forward.',
      status: GivebackRewardStatus.Locked,
      isSecret: true,
    },
  },
  {
    id: 'level-4',
    levelNumber: 4,
    name: 'Community pillar',
    requiredApprovedAmount: 300,
  },
  {
    id: 'level-5',
    levelNumber: 5,
    name: 'Legend',
    requiredApprovedAmount: 500,
    reward: {
      id: 'reward-legend',
      type: GivebackRewardType.SwagCoupon,
      title: 'daily.dev swag coupon',
      secretTitle: 'Mystery reward',
      description: 'For the ones who go all in.',
      status: GivebackRewardStatus.Locked,
      isSecret: true,
    },
  },
];

export const createMockCampaign = (
  overrides: Partial<GivebackCampaign> = {},
): GivebackCampaign => ({
  id: 'campaign-2026',
  name: 'Giveback',
  slug: 'giveback',
  status: GivebackCampaignStatus.Active,
  goalAmount: 10000,
  currency: GIVEBACK_CURRENCY,
  approvedAmount: 5000,
  pendingAmount: 450,
  heroCopy: 'Daily Dev funds the donation. You help unlock it.',
  ...overrides,
});

export const createMockUserProfile = (
  overrides: Partial<GivebackUserProfile> = {},
): GivebackUserProfile => ({
  currentLevel: 2,
  approvedContributionAmount: 85,
  pendingContributionAmount: 25,
  actionsCompletedCount: 4,
  selectedCauseIds: [],
  ...overrides,
});
