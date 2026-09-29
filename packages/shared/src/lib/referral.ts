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
