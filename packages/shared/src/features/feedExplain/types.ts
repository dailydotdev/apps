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

export enum FeedSourceMode {
  Demote = 'demote',
}

/** How the reader steers For You: levels, learning and popular fill-ins. */
export interface FeedControls {
  topics: { keyword: string; mode: FeedTopicMode }[];
  sources: { source: { id: string }; mode: FeedSourceMode }[];
  learning: boolean;
  fillIns: boolean;
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
  follow: { kind?: ExplainFollowKind; factor: number };
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

export interface FeedProfile {
  cohort: boolean;
  learning: boolean;
  interests: FeedProfileInterest[];
  /** Topics the reader turned off in For You. */
  muted: string[];
  blocked: string[];
}
