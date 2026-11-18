import type { Campaign } from '../../graphql/campaigns';
import { CampaignState } from '../../graphql/campaigns';

export const boostDashboardInfo = {
  impressions:
    'The total number of times your boosted posts were shown to users',
  users: 'The total number of unique users that has seen your boosted post',
  spend: 'The total number of cores spent so far',
  members: 'The total number of new members that has joined the Squad',
};

/** The Quick preset of the boost form: a day at a small daily budget */
export const quickBoost = { coresPerDay: 2000, totalDays: 1 };

export enum BoostBudgetMode {
  Quick = 'quick',
  Custom = 'custom',
}

/** The budget a boost again starts from */
export interface LastBoost {
  coresPerDay: number;
  totalDays: number;
}

export const daysLabel = (days: number): string =>
  `${days} ${days === 1 ? 'day' : 'days'}`;

const oneDay = 24 * 60 * 60 * 1000;

/** A completed boost's daily budget and days. A stopped one ended early, so
 * its days no longer tell what it was set to */
export const lastBoostOf = (campaign: Campaign): LastBoost | undefined => {
  if (campaign.state !== CampaignState.Completed || !campaign.flags?.budget) {
    return undefined;
  }

  const totalDays = Math.max(
    1,
    Math.round(
      (new Date(campaign.endedAt).getTime() -
        new Date(campaign.createdAt).getTime()) /
        oneDay,
    ),
  );

  return {
    totalDays,
    coresPerDay: Math.round(campaign.flags.budget / totalDays),
  };
};
