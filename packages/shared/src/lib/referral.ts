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
