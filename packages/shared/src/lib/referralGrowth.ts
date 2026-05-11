import { ReferralCampaignKey } from './referral';

export enum ReferralGrowthSurface {
  PostUpvote = 'post_upvote',
  StreakMilestone = 'streak_milestone',
  TopReaderBadge = 'top_reader_badge',
  DevCard = 'devcard',
  Squad = 'squad',
  Brief = 'brief',
}

export const referralGrowthTriggerMatrix: Record<
  ReferralGrowthSurface,
  {
    campaignKey: ReferralCampaignKey;
    trigger: string;
    shareUnit: string;
  }
> = {
  [ReferralGrowthSurface.PostUpvote]: {
    campaignKey: ReferralCampaignKey.SharePost,
    trigger: 'post_upvote',
    shareUnit: 'post_link',
  },
  [ReferralGrowthSurface.StreakMilestone]: {
    campaignKey: ReferralCampaignKey.ShareProfile,
    trigger: 'streak_milestone',
    shareUnit: 'profile_link',
  },
  [ReferralGrowthSurface.TopReaderBadge]: {
    campaignKey: ReferralCampaignKey.ShareProfile,
    trigger: 'top_reader_badge',
    shareUnit: 'profile_link',
  },
  [ReferralGrowthSurface.DevCard]: {
    campaignKey: ReferralCampaignKey.ShareProfile,
    trigger: 'devcard_generated',
    shareUnit: 'devcard_profile_link',
  },
  [ReferralGrowthSurface.Squad]: {
    campaignKey: ReferralCampaignKey.Generic,
    trigger: 'squad_invite',
    shareUnit: 'squad_invitation_link',
  },
  [ReferralGrowthSurface.Brief]: {
    campaignKey: ReferralCampaignKey.SharePost,
    trigger: 'brief_share',
    shareUnit: 'brief_post_link',
  },
};
