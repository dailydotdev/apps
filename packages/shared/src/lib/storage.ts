export enum StorageTopic {
  Squad = 'squad',
  ReferralCampaign = 'referralCampaign',
  Popup = 'popup',
}

export const APP_KEY_PREFIX = 'dailydev';

export const generateStorageKey = (
  topic: StorageTopic,
  key: string,
  identifier = 'global',
): string => `${APP_KEY_PREFIX}:${topic}:${key}:${identifier}`;

export const LEGO_REFERRAL_CAMPAIGN_MAY_2023_HIDDEN_FROM_HEADER_KEY =
  generateStorageKey(StorageTopic.ReferralCampaign, 'lego0523HiddenFromHeader');

export const LEGO_REFERRAL_CAMPAIGN_MAY_2023_SEEN_MODAL_KEY =
  generateStorageKey(StorageTopic.ReferralCampaign, 'lego0523SeenModal');
