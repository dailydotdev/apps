// Type model for the Giveback initiative. Shapes are intentionally aligned with
// the intended backend GraphQL contract so the Phase 1 mock layer can be swapped
// for live queries with minimal churn. See the master plan for details.

export enum GivebackCampaignStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Active = 'active',
  Paused = 'paused',
  Ended = 'ended',
}

export enum GivebackActionValidationType {
  Automatic = 'automatic',
  Manual = 'manual',
  Hybrid = 'hybrid',
  None = 'none',
}

export enum GivebackUserActionStatus {
  NotStarted = 'not_started',
  Started = 'started',
  Submitted = 'submitted',
  PendingReview = 'pending_review',
  AutoValidating = 'auto_validating',
  Approved = 'approved',
  Rejected = 'rejected',
  Expired = 'expired',
  NeedsMoreInfo = 'needs_more_info',
  CountedTowardGoal = 'counted_toward_goal',
}

export enum GivebackRewardStatus {
  Locked = 'locked',
  Unlocked = 'unlocked',
  Revealed = 'revealed',
  Claimed = 'claimed',
  Expired = 'expired',
}

export enum GivebackRewardType {
  DailyPlus = 'daily_plus',
  Cores = 'cores',
  SwagCoupon = 'swag_coupon',
  Badge = 'badge',
  Other = 'other',
}

export enum GivebackCauseStatus {
  Active = 'active',
  Inactive = 'inactive',
  PendingReview = 'pending_review',
  Approved = 'approved',
  Rejected = 'rejected',
  Archived = 'archived',
}

export enum GivebackActionCategory {
  SocialMedia = 'social_media',
  CreatorContent = 'creator_content',
  Referrals = 'referrals',
  ProductFeedback = 'product_feedback',
  CommunityPosts = 'community_posts',
  CommunityLove = 'community_love',
}

export enum GivebackActionPersona {
  Creator = 'creator',
  Student = 'student',
  SeniorDeveloper = 'senior_developer',
  PowerUser = 'power_user',
  CommunityMember = 'community_member',
  OpenSourceContributor = 'open_source_contributor',
  TeamLead = 'team_lead',
  DailyPlusSubscriber = 'daily_plus_subscriber',
}

// Real-world platform an action lives on, used to surface the platform's brand
// logo so the catalog reads as a growth/social initiative (post on X, video on
// YouTube, etc.).
export enum GivebackActionPlatform {
  X = 'x',
  YouTube = 'youtube',
  Hashnode = 'hashnode',
  GitHub = 'github',
  Reddit = 'reddit',
  LinkedIn = 'linkedin',
  AppStore = 'app_store',
  ChromeWebStore = 'chrome_web_store',
  DailyDev = 'daily_dev',
  // Extended surfaces from the community-led growth action library.
  EdgeAddons = 'edge_addons',
  FirefoxAddons = 'firefox_addons',
  GooglePlay = 'google_play',
  Trustpilot = 'trustpilot',
  G2 = 'g2',
  Capterra = 'capterra',
  ProductHunt = 'product_hunt',
  Directory = 'directory',
  Medium = 'medium',
  Dev = 'dev',
  Blog = 'blog',
  Newsletter = 'newsletter',
  Notion = 'notion',
  Website = 'website',
  HackerNews = 'hacker_news',
  StackOverflow = 'stack_overflow',
  Discord = 'discord',
  Slack = 'slack',
  Telegram = 'telegram',
  IndieHackers = 'indie_hackers',
  Forum = 'forum',
  Twitch = 'twitch',
  Podcast = 'podcast',
  Event = 'event',
  Wiki = 'wiki',
}

export type GivebackActionCategoryFilter = GivebackActionCategory | 'all';
export type GivebackActionPersonaFilter = GivebackActionPersona | 'all';

// Crowdfunding-style milestone: a community amount that, once reached, unlocks a
// concrete outcome. Modeled as ascending thresholds so the UI can show a
// LOCKED/UNLOCKED tracker and the distance to the next unlock.
export interface GivebackStretchGoal {
  id: string;
  amount: number;
  title: string;
  description: string;
}

// Companies and people can top up the campaign budget directly. Sponsorships go
// straight into the pot, so a sponsor's amount counts toward the same goal the
// community is unlocking through actions.
export enum GivebackSponsorType {
  Company = 'company',
  Individual = 'individual',
}

// Tier is derived from the sponsored amount (see getSponsorTier) so the data
// stays lean and a pledge never disagrees with its badge.
export enum GivebackSponsorTier {
  Platinum = 'platinum',
  Gold = 'gold',
  Silver = 'silver',
  Backer = 'backer',
}

export interface GivebackSponsor {
  id: string;
  name: string;
  type: GivebackSponsorType;
  amount: number;
  currency: string;
  url?: string;
  /** Square brand logo shown on the sponsor wall; falls back to initials. */
  logoUrl?: string;
  message?: string;
  /** Sponsors who funded the pot before launch lead the wall. */
  isFounding?: boolean;
  createdAt: string;
}

export interface GivebackSponsorInput {
  name: string;
  type: GivebackSponsorType;
  amount: number;
  message?: string;
}

export interface GivebackCampaign {
  id: string;
  name: string;
  slug: string;
  status: GivebackCampaignStatus;
  goalAmount: number;
  currency: string;
  /** Donation amount that has been validated and is included in donation reporting. */
  approvedAmount: number;
  /** Donation amount awaiting validation. Shown honestly as pending, never as counted. */
  pendingAmount: number;
  /** Portion of the raised pot contributed by sponsors (companies + people). */
  sponsoredAmount: number;
  /** Number of developers who have contributed at least one action (social proof). */
  backersCount: number;
  /** Developers who contributed in the last 24h (momentum signal). */
  backersLast24h: number;
  /** Ordered community unlocks for the stretch-goal tracker. */
  stretchGoals: GivebackStretchGoal[];
  /** Companies and people topping up the budget. */
  sponsors: GivebackSponsor[];
  heroCopy?: string;
  startAt?: string;
}

export interface GivebackReward {
  id: string;
  type: GivebackRewardType;
  title: string;
  /** Teaser shown while the reward is still a mystery. */
  secretTitle: string;
  description?: string;
  status: GivebackRewardStatus;
  isSecret: boolean;
  expiresAt?: string;
}

export interface GivebackLevel {
  id: string;
  levelNumber: number;
  name: string;
  /** Approved contribution required to reach this level. */
  requiredApprovedAmount: number;
  requiredActionCount?: number;
  reward?: GivebackReward;
}

export interface GivebackUserProfile {
  currentLevel: number;
  approvedContributionAmount: number;
  pendingContributionAmount: number;
  actionsCompletedCount: number;
  selectedCauseIds: string[];
}

// Shells for later phases (catalog, causes). Defined now so the type model and
// compliance guarantees exist from the start, even though the UI ships later.

export interface GivebackAction {
  id: string;
  title: string;
  description?: string;
  category: GivebackActionCategory;
  platform: GivebackActionPlatform;
  personaTags: GivebackActionPersona[];
  donationAmount: number;
  currency: string;
  validationType: GivebackActionValidationType;
  requiresLink: boolean;
  requiresImage: boolean;
  requiresNote: boolean;
  /** Whether this action can grant a reward. Always false for Love actions. */
  isRewarded: boolean;
  /** Whether this action can unlock donation value. Always false for Love actions. */
  donationEligible: boolean;
  /** Review/rating style actions that a third-party platform forbids incentivizing. */
  isComplianceSensitive: boolean;
  /** Voluntary "for love" action with zero donation/reward by design. */
  isLoveAction: boolean;
  externalUrl?: string;
  instructions?: string;
  /** Total developers who have completed this action (community proof). */
  contributorsCount?: number;
  /** Developers who completed it in the last 24h (real-time momentum). */
  contributorsLast24h?: number;
  /** A few contributor avatar URLs, shown as overlapping faces on the card. */
  contributorAvatars?: string[];
  /** Popular action; surfaced first under the "Recommended" sort with a badge. */
  isTrending?: boolean;
}

// Developer leading the community contribution board, spotlighted on the
// "Take action" tab to put community engagement front and center.
export interface GivebackTopContributor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  /** Total donation value this person has unlocked through actions. */
  contributionAmount: number;
  currency: string;
  actionsCount: number;
}

// A single row on the gamified contribution leaderboard. Carries the playful
// signals (streak, rank movement, title, medal) that turn contributing into a
// game and nudge people to keep climbing together.
export interface GivebackLeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  contributionAmount: number;
  currency: string;
  actionsCount: number;
  /** Consecutive days the person has taken at least one action. */
  streakDays: number;
  /** Net rank change since yesterday; positive means they climbed. */
  rankChange: number;
  /** Playful earned title shown as a badge (e.g. "Streak master"). */
  title?: string;
  /** Marks the viewer's own row so it can be highlighted and nudged. */
  isCurrentUser?: boolean;
}

// The collective "we're a team" signal: how much the community has unlocked
// today against a shared daily target, so every individual action visibly
// fills one shared bar.
export interface GivebackCommunityRally {
  unlockedToday: number;
  targetToday: number;
  currency: string;
  contributorsToday: number;
}

export interface GivebackUserAction {
  actionId: string;
  status: GivebackUserActionStatus;
  unlockedDonationAmount: number;
  pendingDonationAmount: number;
  approvedDonationAmount: number;
  rejectedDonationAmount: number;
  evidenceLink?: string;
  evidenceImage?: string;
  note?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  needsMoreInfoReason?: string;
}

export interface GivebackActionSubmissionInput {
  actionId: string;
  evidenceLink?: string;
  evidenceImage?: string;
  note?: string;
}

export interface GivebackDonationAccounting {
  unlockedDonationAmount: number;
  pendingDonationAmount: number;
  approvedDonationAmount: number;
  rejectedDonationAmount: number;
}

export interface GivebackCauseSuggestionInput {
  name: string;
  url: string;
  note?: string;
  category?: string;
}

export interface GivebackCommunityEvent {
  id: string;
  actorLabel: string;
  actorName: string;
  actorAvatar: string;
  actionLabel: string;
  amount?: number;
  currency: string;
  causeName?: string;
  createdAt: string;
  isAnonymous: boolean;
}

export interface GivebackCause {
  id: string;
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  category?: string;
  status: GivebackCauseStatus;
  sortOrder: number;
  /** Top picks surfaced first in the catalog; the rest live behind "Show more". */
  recommended?: boolean;
}
