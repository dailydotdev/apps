import { getFirstQueryParam } from './func';

export enum ReferralCampaignKey {
  Generic = 'generic',
  Search = 'search',
  SharePost = 'share_post',
  ShareComment = 'share_comment',
  ShareProfile = 'share_profile',
  ShareSource = 'share_source',
  ShareTag = 'share_tag',
  ShareAgent = 'share_agent',
  ShareSlack = 'share_slack',
  ShareHighlights = 'share_highlights',
  ShareWorld = 'share_world',
  ShareTool = 'share_tool',
}

const referralCampaignValues = new Set<string>(
  Object.values(ReferralCampaignKey),
);

export const isReferralCampaignKey = (
  value: string | undefined,
): value is ReferralCampaignKey => !!value && referralCampaignValues.has(value);

export interface InviteReferral {
  userId: string;
  campaign: ReferralCampaignKey;
}

type ReferralQuery = Partial<Record<'cid' | 'userid', string | string[]>>;

// The `cid` + `userid` pair an invite link (/join) carries and forwards to
// the signup funnel.
export const getInviteReferral = (
  query: ReferralQuery,
): InviteReferral | null => {
  const userId = getFirstQueryParam(query.userid);
  const campaign = getFirstQueryParam(query.cid);

  if (!userId || userId === '404' || !isReferralCampaignKey(campaign)) {
    return null;
  }

  return { userId, campaign };
};

export const formatReferralLadderMonths = (months: number): string => {
  if (months % 12 === 0) {
    const years = months / 12;

    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }

  return `${months} ${months === 1 ? 'month' : 'months'}`;
};

export const getReferralLadderReward = (months: number): string =>
  `${formatReferralLadderMonths(months)} of Plus`;

export const REFERRAL_INVITE_COPIED_TOAST =
  '✅ Copied your invite message and link';

export const REFERRAL_INVITE_TEXT = `hey! I've been using daily.dev for my dev news and it's honestly the best feed I've found. you should give it a try:`;

export const getReferralInviteMessage = (link: string): string =>
  `${REFERRAL_INVITE_TEXT} ${link}`;
