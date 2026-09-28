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

export interface ReferralLadderStep {
  invites: number;
  duration: string;
  reward: string;
}

const plusFor = (duration: string): string => `${duration} of Plus`;

// A friend only counts once they sign up and stay active for this many days.
export const REFERRAL_LADDER_ACTIVE_DAYS = 3;

export const referralLadderSteps: ReferralLadderStep[] = [
  { invites: 1, duration: '1 month', reward: plusFor('1 month') },
  { invites: 2, duration: '3 months', reward: plusFor('3 months') },
  { invites: 3, duration: '1 year', reward: plusFor('1 year') },
];

export const getNextReferralLadderStep = (
  referredCount: number,
): ReferralLadderStep | undefined =>
  referralLadderSteps.find(({ invites }) => invites > referredCount);

// What the invited friend gets for signing up, on top of the inviter's step.
const REFERRAL_FRIEND_REWARD_DURATION = '1 month';
export const REFERRAL_FRIEND_REWARD = plusFor(REFERRAL_FRIEND_REWARD_DURATION);

export const REFERRAL_INVITE_COPIED_TOAST =
  '✅ Copied your invite message and link';

export const REFERRAL_INVITE_TEXT = `hey! I've been using daily.dev for my dev news and it's honestly the best feed I've found. I want to give you ${REFERRAL_FRIEND_REWARD_DURATION} of daily.dev Plus for free so you can try it properly (no ads, custom feeds, and a lot more). grab it here:`;

export const getReferralInviteMessage = (link: string): string =>
  `${REFERRAL_INVITE_TEXT} ${link}`;
