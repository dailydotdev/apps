export enum ExplainOrigin {
  // A tag the reader follows.
  Declared = 'declared',
  // Learned from reading, never followed.
  Inferred = 'inferred',
  // Only given a weight by the reader.
  Set = 'set',
}

export enum ExplainRole {
  Central = 'central',
  Side = 'side',
}

export enum ExplainFollowKind {
  Source = 'source',
  Squad = 'squad',
  Author = 'author',
}

export enum ExplainStrength {
  Strong = 'strong',
  Moderate = 'moderate',
  Confirmed = 'confirmed',
  EarlySignal = 'early_signal',
}

export enum TopicControl {
  Weight = 'weight',
  Boost = 'boost',
  Demote = 'demote',
  StopLearning = 'stop_learning',
}

/** A topic's level in For You as the reader set it. No level is Auto. */
export enum FeedTopicMode {
  Boost = 'boost',
  Demote = 'demote',
  StopLearning = 'stop_learning',
  Off = 'off',
}

/**
 * A source's level in For You. Off ignores the reader's follow of it there;
 * they still follow it everywhere else.
 */
export enum FeedSourceMode {
  Boost = 'boost',
  Demote = 'demote',
  Off = 'off',
}

/** An author's level in For You, the same levels a source has. */
export enum FeedAuthorMode {
  Boost = 'boost',
  Demote = 'demote',
  Off = 'off',
}

/** What the reader set on a card's source or author, as it was ranked. */
export enum FollowControl {
  Boost = 'boost',
  Demote = 'demote',
  Off = 'off',
  Weight = 'weight',
}

/** How long a change lasts. None lasts until the reader changes it. */
export enum FeedControlDuration {
  ThreeDays = 'three_days',
  Week = 'week',
}

/**
 * A topic or source the reader set: a level, or an exact weight (Plus),
 * until `expiresAt` (Plus) or for good. An exact weight stays stored when
 * Plus ends but counts only while the reader has it.
 */
export interface FeedControl<Mode> {
  mode: Mode | null;
  weight: number | null;
  expiresAt: string | null;
}

export interface FeedRankingValue {
  key: string;
  value: number;
}

/** How the reader steers For You: levels, learning and popular fill-ins. */
export interface FeedControls {
  topics: ({ keyword: string } & FeedControl<FeedTopicMode>)[];
  sources: ({ source: { id: string } } & FeedControl<FeedSourceMode>)[];
  authors: ({ user: { id: string } } & FeedControl<FeedAuthorMode>)[];
  learning: boolean;
  fillIns: boolean;
  /** The ranking settings the reader changed, which count with Plus. */
  ranking: FeedRankingValue[];
}

/**
 * The first version of a ranked card's explanation, daily-feed's
 * `policy.Explanation`: every factor the score multiplies, at 3 decimals.
 * Optional keys are absent rather than null.
 */
export interface RankedExplain {
  lane: string;
  v: 1;
  score: number;
  /** The card's place in the feed, when the ranking picked it. */
  position?: number;
  base: { value: number; prior_lift?: number; viewers: number };
  /** The best-matching topic, absent when a follow alone let the card in. */
  match?: {
    tag: string;
    origin: ExplainOrigin;
    role: ExplainRole;
    role_weight: number;
    strength?: ExplainStrength;
    weight: number;
    computed_weight: number;
    recency?: number;
    stories?: number;
    hidden_stories?: number;
    hide_penalty?: number;
    control?: TopicControl;
    factor: number;
  };
  /**
   * The larger of the source's and the author's follow, then the levels the
   * reader set on either. A follow set to Off is no follow.
   */
  follow: {
    kind?: ExplainFollowKind;
    factor: number;
    source_control?: FollowControl;
    author_control?: FollowControl;
  };
  age: { days: number; factor: number };
  seen: { shows: number; factor: number };
  /** The variety adjustments, on picked cards. */
  slot?: {
    source_repeat: number;
    topic_repeat: number;
    same_headline: number;
    waiting: number;
    waiting_tag?: string;
    pick_score: number;
  };
}

/**
 * A card's explanation as feedV2 returns it with `explain`. Key on `v`: a
 * card from another lane than the personalized one only names its lane, and
 * a version this client doesn't know reads the same way.
 */
export type FeedItemExplain = RankedExplain | { lane: string; v?: never };

export const isRankedExplain = (
  explain: FeedItemExplain | null | undefined,
): explain is RankedExplain => explain?.v === 1;

export interface FeedProfileInterest {
  tag: string;
  origin: ExplainOrigin;
  strength: ExplainStrength | null;
  stories: number;
  hiddenStories: number;
  computedWeight: number;
  control: TopicControl | null;
  weight: number;
  backed: boolean;
}

/** A ranking setting as For You ranks with it, and its value untouched. */
export interface FeedProfileRankingSetting extends FeedRankingValue {
  defaultValue: number;
}

export interface FeedProfile {
  cohort: boolean;
  learning: boolean;
  interests: FeedProfileInterest[];
  /** Topics the reader turned off in For You. */
  muted: string[];
  blocked: string[];
  /** Every ranking setting the reader can change, empty outside the cohort. */
  ranking: FeedProfileRankingSetting[];
}

/**
 * Changes to the controls on top of the stored ones, which the feed ranks
 * with while Tune is open. An
 * entry with neither a mode nor a weight is Auto, a ranking setting without
 * a value its default.
 */
export interface FeedControlsDraft {
  topics?: { keyword: string; mode?: FeedTopicMode; weight?: number }[];
  sources?: { sourceId: string; mode?: FeedSourceMode; weight?: number }[];
  authors?: { userId: string; mode?: FeedAuthorMode; weight?: number }[];
  ranking?: { key: string; value?: number }[];
  learning?: boolean;
}

/** Tune's tabs, by the controls they hold. */
export enum FeedTuneTab {
  Topics = 'Topics',
  Sources = 'Sources and authors',
  Ranking = 'Ranking',
}
