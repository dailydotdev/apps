export enum StorageTopic {
  Squad = 'squad',
  ReferralCampaign = 'referralCampaign',
}

export const APP_KEY_PREFIX = 'dailydev';

export const generateStorageKey = (
  topic: StorageTopic,
  key: string,
  identifier = 'global',
): string => `${APP_KEY_PREFIX}:${topic}:${key}:${identifier}`;

export const LEGO_REFERRAL_CAMPAIGN_MAY_2023_KEY = generateStorageKey(
  StorageTopic.ReferralCampaign,
  'hiddenFromHeader',
);
