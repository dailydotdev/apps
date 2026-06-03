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
  heroCopy?: string;
  startAt?: string;
  endAt?: string;
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
  category: string;
  personaTags: string[];
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
}
