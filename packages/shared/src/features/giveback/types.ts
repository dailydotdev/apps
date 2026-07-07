// Frontend "Giveback" is the brand name for the backend "contribution"
// program. Shapes here mirror the daily-api GraphQL contract so the UI can bind
// directly to live queries. User-specific fields are null for anonymous
// visitors (see the public `contributionStatus` query).

export interface ContributionStatus {
  enabled: boolean;
  eligible: boolean | null;
  // Campaign points unlocked this cycle. Points map 1:1 to currency.
  currentCyclePoints: number;
  currentCycleTargetPoints: number;
  lifetimePoints: number;
  // Total amount donated to causes so far, in cents.
  lifetimeAmountCents: number;
  // Distinct developers who have contributed at least one approved action.
  contributorsCount: number;
  userPoints: number | null;
}

// Real-time event fired when an approved action lands. Drives the live "+$"
// pop on the gift entry point. `awardedPoints` maps 1:1 to currency.
export interface ContributionActionCompleted {
  submissionId: string;
  userId: string;
  actionId: string;
  awardedPoints: number;
}

// The founding-contributor award: a one-time, capped gift for the first N
// contributors, granted via claimContributionFoundingAward once a contributor
// has an approved action. Campaign fields render for everyone;
// `isFoundingMember`/`memberNumber` describe the visitor (false/null until
// they sign in and claim it).
export interface ContributionFoundingAward {
  totalSpots: number;
  claimedCount: number;
  isFoundingMember: boolean;
  memberNumber: number | null;
}

// A global campaign milestone (a lifetime approved-points threshold, which maps
// 1:1 to currency). `contributionLastReachedMilestone` returns the highest one
// crossed so far; crossing a new one pops the celebratory popover.
export interface ContributionMilestone {
  id: string;
  value: number;
  title: string | null;
  reachedAt: string | null;
}

// Derived from the sponsored amount on the backend, so a pledge can never
// disagree with its badge.
export enum ContributionSponsorTier {
  Gold = 'gold',
  Silver = 'silver',
  Bronze = 'bronze',
}

export interface ContributionSponsor {
  id: string;
  name: string;
  amountCents: number;
  url: string | null;
  logoUrl: string | null;
  tier: ContributionSponsorTier;
}

// A nonprofit a contributor can direct their actions toward. Picked during the
// join flow and editable later.
export interface ContributionCause {
  id: string;
  title: string;
  url: string | null;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
}

// Filter bucket for the action catalog (e.g. "Social media", "Reviews").
export interface ContributionActionCategory {
  id: string;
  title: string;
}

// The community pool's projected current-cycle points, grouped by cause
// category, as returned by `contributionCauseBreakdown`. Points map 1:1 to
// currency, so the causes breakdown donut renders them straight as dollars.
// `category` is null for the bucket of causes without one.
export interface ContributionCauseCategoryBreakdown {
  category: string | null;
  points: number;
}

// The kind of perk a reward tier grants. Drives both the roadmap node's icon and
// the claim reveal (see `resolveRewardReveal`). Mirrors the daily-api enum.
export enum ContributionRewardType {
  Cores = 'cores',
  PlusDays = 'plus_days',
  StoreDiscount = 'store_discount',
  SuggestCauses = 'suggest_causes',
  Council = 'council',
  PatchyPicture = 'patchy_picture',
  Joke = 'joke',
  Trivia = 'trivia',
  Call = 'call',
  Privilege = 'privilege',
  Custom = 'custom',
}

// Per-type reward parameters carried on the tier's `metadata` jsonb. Only the
// grant/reveal-driving fields are typed; each is present only for its reward
// type (amount → cores, days → plus_days, percent → store_discount).
export interface ContributionRewardMetadata {
  amount?: number;
  days?: number;
  percent?: number;
}

// A milestone reward unlocked once a contributor's points cross its threshold.
// Drives the "next reward" cue in the contribution summary and floating bar, and
// the reward-ladder roadmap on the Impact tab.
export interface ContributionRewardTier {
  id: string;
  title: string;
  description: string | null;
  thresholdPoints: number;
  rewardType: ContributionRewardType;
  metadata: ContributionRewardMetadata;
}

// Review outcome for a submitted action. A fresh submission lands `flagged`
// (awaiting review); `approved` counts toward the cause; `rejected` lets the
// contributor try again.
export enum ContributionSubmissionStatus {
  Approved = 'approved',
  Flagged = 'flagged',
  Rejected = 'rejected',
}

export interface ContributionSubmission {
  id: string;
  actionId: string;
  status: ContributionSubmissionStatus;
  awardedPoints: number;
  createdAt: string;
  reviewedAt: string | null;
}

// How the card helps the user complete an action: open an outbound link, surface
// their own invite link, or pick from a rotating pool of targets. Drives which
// assist UI the submission modal renders.
export enum ContributionAssistType {
  ExternalLink = 'external_link',
  ReferralLink = 'referral_link',
  LinkPool = 'link_pool',
}

// What the action reads as on the catalog (which surface it lives on) plus the
// optional how-to and outbound link. `isLoveAction` marks a voluntary
// thank-you that carries no points and skips the proof flow. `assistType` picks
// the completion helper (see ContributionAssistType).
export interface ContributionActionMetadata {
  platform: string | null;
  instructions: string | null;
  externalUrl: string | null;
  isLoveAction: boolean;
  assistType: ContributionAssistType | null;
}

// A single target from a link_pool action's pool (e.g. a Reddit thread to
// comment on). The catalog surfaces a randomized handful at a time.
export interface ContributionActionLink {
  id: string;
  url: string;
  label: string | null;
}

// Which kinds of proof an action asks for, and whether each is mandatory. Drives
// the submission form: a field is only rendered when its key is present.
export interface ContributionActionEvidence {
  url?: { required?: boolean; allowedDomains?: string[] };
  screenshot?: { required?: boolean };
  note?: { required?: boolean };
}

// A single growth move a contributor can take to unlock points for their causes.
// `points` map 1:1 to currency, like the campaign totals. Per-user fields
// (completions, cooldown, latest submission) are null/zero for anonymous
// visitors and drive the card's done/in-review state.
export interface ContributionAction {
  id: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  points: number;
  evidence: ContributionActionEvidence;
  metadata: ContributionActionMetadata;
  cooldownSeconds: number | null;
  maxPerUser: number | null;
  userCooldownEndsAt: string | null;
  userCompletions: number;
  latestUserSubmission: ContributionSubmission | null;
}
