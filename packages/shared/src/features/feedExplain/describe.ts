import type { Author } from '../../graphql/comments';
import type { Post } from '../../graphql/posts';
import { isSourceUserSource, SourceType } from '../../graphql/sources';
import type {
  FeedControl,
  FeedControls,
  FeedItemExplain,
  FeedProfile,
  FeedProfileInterest,
  RankedExplain,
} from './types';
import {
  ExplainFollowKind,
  ExplainOrigin,
  ExplainRole,
  ExplainStrength,
  FeedSourceMode,
  FeedTopicMode,
  FollowControl,
  isRankedExplain,
  TopicControl,
} from './types';
import { formatUntil } from './duration';

// The lane the challenger ranks; the others (coldstart, popular) top up a
// short page.
export const challengerLane = 'chal';

/** What put a card on the page, for the dot beside its reason. */
enum ReasonCategory {
  Followed = 'followed',
  Learned = 'learned',
  Following = 'following',
  FillIn = 'fill_in',
}

const reasonDotClassName: Record<ReasonCategory, string> = {
  [ReasonCategory.Followed]: 'bg-accent-cabbage-default',
  [ReasonCategory.Learned]: 'bg-accent-blueCheese-default',
  [ReasonCategory.Following]: 'bg-accent-water-default',
  [ReasonCategory.FillIn]: 'bg-accent-cheese-default',
};

const isFillIn = (explain: FeedItemExplain | null | undefined): boolean =>
  !!explain && explain.lane !== challengerLane;

const isSourceFollow = (explain: RankedExplain): boolean =>
  explain.follow.kind === ExplainFollowKind.Source ||
  explain.follow.kind === ExplainFollowKind.Squad;

enum FollowSide {
  Source = 'source',
  Author = 'author',
}

const raisingControls: (FollowControl | undefined)[] = [
  FollowControl.Boost,
  FollowControl.Weight,
];

/**
 * Whose follow factor a card got: the follow that counted, or without one
 * the source or author the reader set a level on.
 */
const getFollowSide = ({ follow }: RankedExplain): FollowSide | undefined => {
  if (follow.kind) {
    return follow.kind === ExplainFollowKind.Author
      ? FollowSide.Author
      : FollowSide.Source;
  }
  if (follow.source_control && follow.source_control !== FollowControl.Off) {
    return FollowSide.Source;
  }
  if (follow.author_control && follow.author_control !== FollowControl.Off) {
    return FollowSide.Author;
  }
  return undefined;
};

// Show more, or an exact weight above 1, brings a source's or author's posts
// in the way a follow does.
const getGatheringSide = (explain: RankedExplain): FollowSide | undefined => {
  const { match, follow } = explain;
  if (match || follow.kind) {
    return undefined;
  }
  if (raisingControls.includes(follow.source_control)) {
    return FollowSide.Source;
  }
  return raisingControls.includes(follow.author_control)
    ? FollowSide.Author
    : undefined;
};

/**
 * The reader followed the card's source or squad when it was ranked: the
 * follow counted, or was set to Off, which only a follow is offered.
 */
export const isSourceFollowed = (
  explain: FeedItemExplain | null | undefined,
): boolean =>
  isRankedExplain(explain) &&
  (isSourceFollow(explain) ||
    explain.follow.source_control === FollowControl.Off);

/** The reader followed the card's author when it was ranked. */
export const isAuthorFollowed = (
  explain: FeedItemExplain | null | undefined,
): boolean =>
  isRankedExplain(explain) &&
  (explain.follow.kind === ExplainFollowKind.Author ||
    explain.follow.author_control === FollowControl.Off);

export const getAuthorLabel = (
  author: Pick<Author, 'name' | 'username'>,
): string => author.name || `@${author.username}`;

const getCategory = (
  explain: FeedItemExplain | null | undefined,
): ReasonCategory => {
  if (isFillIn(explain)) {
    return ReasonCategory.FillIn;
  }
  if (!isRankedExplain(explain)) {
    return ReasonCategory.Followed;
  }
  if (explain.follow.kind || getGatheringSide(explain)) {
    return ReasonCategory.Following;
  }
  return explain.match?.origin === ExplainOrigin.Inferred
    ? ReasonCategory.Learned
    : ReasonCategory.Followed;
};

export const getReasonDotClassName = (
  explain: FeedItemExplain | null | undefined,
): string => reasonDotClassName[getCategory(explain)];

/** A topic weight as the boost it gives a post, or No boost. */
export const formatBoost = (weight: number): string =>
  weight > 0 ? `×${(1 + weight).toFixed(2)}` : 'No boost';

const strengthPhrase: Partial<Record<ExplainStrength, string>> = {
  [ExplainStrength.Strong]: 'and read about it often',
  [ExplainStrength.Moderate]: 'and read about it sometimes',
  [ExplainStrength.Confirmed]: 'and read a post on it',
};

/**
 * A note for a topic's Feed settings row, when its boost alone doesn't say
 * enough: why one from reading doesn't count yet, or that only a level the
 * reader set brings it in.
 */
export const getTopicNote = (
  interest: FeedProfileInterest | undefined,
): string | undefined => {
  if (!interest || interest.origin === ExplainOrigin.Set) {
    return 'You set its boost.';
  }
  return interest.origin === ExplainOrigin.Inferred &&
    interest.strength === ExplainStrength.EarlySignal
    ? 'Counts once you read more about it.'
    : undefined;
};

export interface ReasonParts {
  lead: string;
  /** Shown in bold between the lead and the tail. */
  name?: string;
  tail: string;
}

const pickedForYou: ReasonParts = { lead: 'Picked for you', tail: '.' };

/** Why a card is on the page in one sentence, split so the name can be bold. */
export const getReason = (
  post: Post,
  explain: FeedItemExplain | null | undefined,
): ReasonParts => {
  if (isFillIn(explain)) {
    return {
      lead: 'Popular this week.',
      tail: " Your topics didn't have enough new posts, so we added it.",
    };
  }
  if (!isRankedExplain(explain)) {
    return pickedForYou;
  }
  const { match, follow } = explain;
  if (isSourceFollow(explain)) {
    return {
      lead:
        follow.kind === ExplainFollowKind.Squad ? "You're in " : 'You follow ',
      name: post.source?.name,
      tail: match ? `. It's also about #${match.tag}.` : '.',
    };
  }
  if (follow.kind === ExplainFollowKind.Author) {
    return { lead: 'Written by someone you follow', tail: '.' };
  }
  const gatheredBy = getGatheringSide(explain);
  if (gatheredBy) {
    return {
      lead: 'You asked for more from ',
      name:
        gatheredBy === FollowSide.Source || !post.author
          ? post.source?.name
          : getAuthorLabel(post.author),
      tail: '.',
    };
  }
  if (!match) {
    return pickedForYou;
  }
  const name = `#${match.tag}`;
  const isSide = match.role === ExplainRole.Side;
  if (match.origin === ExplainOrigin.Set) {
    const boost = formatBoost(match.weight);
    return isSide
      ? { lead: 'Partly about ', name, tail: `. You gave it a ${boost} boost.` }
      : { lead: 'You gave ', name, tail: ` a ${boost} boost.` };
  }
  if (match.origin === ExplainOrigin.Declared) {
    const phrase = match.strength ? strengthPhrase[match.strength] : undefined;
    const follows = `${phrase ? ` ${phrase}` : ''}.`;
    return isSide
      ? { lead: 'Partly about ', name, tail: `. You follow it${follows}` }
      : { lead: 'You follow ', name, tail: follows };
  }
  const isStrong = match.strength === ExplainStrength.Strong;
  if (isSide) {
    return {
      lead: 'Partly about ',
      name,
      tail: isStrong
        ? ". You've read a lot about it."
        : ". You've read a few posts on it.",
    };
  }
  return isStrong
    ? { lead: "You've read a lot about ", name, tail: '.' }
    : { lead: "You've read a few posts about ", name, tail: '.' };
};

export const getPostTags = (post: Post): string[] =>
  (post.tags?.length ? post.tags : post.sharedPost?.tags ?? []).filter(
    (tag) => tag.length,
  );

export enum ExplainSignalKind {
  Topic = 'topic',
  Source = 'source',
  Author = 'author',
}

export interface ExplainSignal {
  kind: ExplainSignalKind;
  /** The tag, the source id or the author's user id. */
  id: string;
  label: string;
}

/**
 * The rows a card lists: its topics, the one that matched first, its source
 * and, when they count for the card, its author. The follow or level that
 * brought the card in puts its source or author first.
 */
export const getExplainSignals = (
  post: Post,
  explain: FeedItemExplain | null | undefined,
  limit: number,
  /** The reader set a level on the author since the card was ranked. */
  hasAuthorControl = false,
): ExplainSignal[] => {
  const matched = isRankedExplain(explain) ? explain.match?.tag : undefined;
  const topics = [
    ...new Set([...(matched ? [matched] : []), ...getPostTags(post)]),
  ].map(
    (tag): ExplainSignal => ({
      kind: ExplainSignalKind.Topic,
      id: tag,
      label: `#${tag}`,
    }),
  );
  const { source, author } = post;
  const ranked = isRankedExplain(explain) ? explain : undefined;
  let leadSide: FollowSide | undefined;
  if (ranked) {
    leadSide = ranked.follow.kind
      ? getFollowSide(ranked)
      : getGatheringSide(ranked);
  }
  const sourceSignal: ExplainSignal | undefined =
    source?.id && !isSourceUserSource(source)
      ? {
          kind: ExplainSignalKind.Source,
          id: source.id,
          label: source.name ?? source.id,
        }
      : undefined;
  const isAuthorCounted =
    hasAuthorControl ||
    leadSide === FollowSide.Author ||
    !!ranked?.follow.author_control;
  const authorSignal: ExplainSignal | undefined =
    author?.id && isAuthorCounted
      ? {
          kind: ExplainSignalKind.Author,
          id: author.id,
          label: getAuthorLabel(author),
        }
      : undefined;
  const sideSignal: Record<FollowSide, ExplainSignal | undefined> = {
    [FollowSide.Source]: sourceSignal,
    [FollowSide.Author]: authorSignal,
  };
  const lead = leadSide && sideSignal[leadSide];
  const trailing = [sourceSignal, authorSignal].filter(
    (signal): signal is ExplainSignal => !!signal && signal !== lead,
  );
  const otherTopics = topics.slice(
    0,
    Math.max(0, limit - trailing.length - (lead ? 1 : 0)),
  );
  return [...(lead ? [lead] : []), ...otherTopics, ...trailing].slice(0, limit);
};

export interface SignalMeta {
  text: string;
  className: string;
}

export const topicModeMeta: Record<FeedTopicMode, SignalMeta> = {
  [FeedTopicMode.Boost]: {
    text: 'Showing more',
    className: 'text-accent-avocado-default',
  },
  [FeedTopicMode.Demote]: {
    text: 'Showing less',
    className: 'text-accent-bun-default',
  },
  [FeedTopicMode.StopLearning]: {
    text: 'Not learning from your reading',
    className: 'text-accent-ketchup-default',
  },
  [FeedTopicMode.Off]: {
    text: 'Off in For You',
    className: 'text-accent-ketchup-default',
  },
};

const exactWeightMeta: SignalMeta = {
  text: 'Your exact boost',
  className: 'text-accent-cabbage-default',
};

const pausedWeightMeta: SignalMeta = {
  text: 'Your exact boost, kept for Plus',
  className: 'text-text-quaternary',
};

/** A source's or author's level. Off ignores the follow, it hides nothing. */
export const followModeMeta: Record<FeedSourceMode, SignalMeta> = {
  [FeedSourceMode.Boost]: topicModeMeta[FeedTopicMode.Boost],
  [FeedSourceMode.Demote]: topicModeMeta[FeedTopicMode.Demote],
  [FeedSourceMode.Off]: {
    text: 'Follow off in For You',
    className: 'text-accent-ketchup-default',
  },
};

/**
 * What the reader set on a topic, source or author, and when it ends. An
 * exact boost only counts while the reader has Plus.
 */
export const getControlMeta = <Mode extends string>(
  control: FeedControl<Mode> | undefined,
  isPlus: boolean,
  modeMeta: Partial<Record<string, SignalMeta>> = topicModeMeta,
): SignalMeta | undefined => {
  if (!control) {
    return undefined;
  }
  if (!control.mode && !isPlus) {
    return pausedWeightMeta;
  }
  const meta = (control.mode && modeMeta[control.mode]) || exactWeightMeta;
  return control.expiresAt
    ? { ...meta, text: `${meta.text} ${formatUntil(control.expiresAt)}` }
    : meta;
};

const getSideFactor = (
  explain: FeedItemExplain | null | undefined,
  side: FollowSide,
): number =>
  isRankedExplain(explain) && getFollowSide(explain) === side
    ? explain.follow.factor
    : 1;

/** The multiplier a source's posts got from a follow or level, else 1. */
export const getSourceFactor = (
  explain: FeedItemExplain | null | undefined,
): number => getSideFactor(explain, FollowSide.Source);

/** The multiplier an author's posts got from a follow or level, else 1. */
export const getAuthorFactor = (
  explain: FeedItemExplain | null | undefined,
): number => getSideFactor(explain, FollowSide.Author);

/** The level the reader set on a topic. */
export const getTopicLevel = (
  tag: string,
  controls: FeedControls | undefined,
  profile: FeedProfile | undefined,
): FeedTopicMode | undefined => {
  if (controls) {
    return (
      controls.topics.find(({ keyword }) => keyword === tag)?.mode ?? undefined
    );
  }
  // The profile lags a change behind the controls, so it only stands in
  // until they load.
  if (profile?.muted.includes(tag)) {
    return FeedTopicMode.Off;
  }
  const interest = profile?.interests.find((item) => item.tag === tag);
  return interest?.control === TopicControl.Demote
    ? FeedTopicMode.Demote
    : undefined;
};

export const getTopicWeight = (
  tag: string,
  explain: FeedItemExplain | null | undefined,
  profile: FeedProfile | undefined,
):
  | {
      weight: number;
      /** What Auto gives it, before the reader's level or weight. */
      computedWeight: number;
      isSet: boolean;
    }
  | undefined => {
  // The profile is weighed with the reader's latest levels, the
  // explanation with the ones the card was ranked on.
  if (profile) {
    const interest = profile.interests.find((item) => item.tag === tag);
    return {
      weight: interest?.weight ?? 0,
      computedWeight: interest?.computedWeight ?? 0,
      isSet: !!interest?.control,
    };
  }
  if (isRankedExplain(explain) && explain.match?.tag === tag) {
    return {
      weight: explain.match.weight,
      computedWeight: explain.match.computed_weight,
      isSet: !!explain.match.control,
    };
  }
  return undefined;
};

export interface ScoreFactor {
  label: string;
  /** What the factor measures, for its tooltip. */
  hint: string;
  /** What the factor multiplies the score by. */
  multiplier: number;
}

export interface ScoreBreakdownParts {
  /** The factors that moved the score, boosts first. */
  factors: ScoreFactor[];
  /** The factors that left it as it was. */
  unchanged: ScoreFactor[];
  score: number;
}

// At two decimals, as the breakdown shows it.
const hasEffect = ({ multiplier }: ScoreFactor): boolean =>
  Math.round(multiplier * 100) !== 100;

/**
 * Each multiplier of the card's score, which multiply into its pick score.
 * The score has no fixed scale, only an order: the feed shows the highest
 * first, and most cards end up below 1.
 */
export const getScoreBreakdown = (
  explain: RankedExplain,
): ScoreBreakdownParts => {
  const { score, base, match, follow, age, seen, slot } = explain;
  const multipliers: ScoreFactor[] = [
    {
      label: 'Engagement',
      hint: 'How much other readers clicked, upvoted, and commented on this post, compared with a typical post.',
      multiplier: base.value,
    },
    {
      label: 'Topic match',
      hint: 'How close the post is to the topics you follow and read.',
      multiplier: match?.factor ?? 1,
    },
    {
      label: 'Follow',
      hint: 'A boost when you follow its source, squad, or author, with the level you set on them.',
      multiplier: follow.factor,
    },
    {
      label: 'Freshness',
      hint: 'Newer posts score higher, and older ones slowly fade.',
      multiplier: age.factor,
    },
    {
      label: 'Seen before',
      hint: "Moves the post down if you've already seen it in your feed.",
      multiplier: seen.factor,
    },
    ...(slot
      ? [
          {
            label: "Topic's turn",
            hint: "A boost when a topic you like hasn't been in your feed for a while.",
            multiplier: slot.waiting,
          },
          {
            label: 'Source variety',
            hint: 'Moves the post down when your feed already has posts from the same source.',
            multiplier: slot.source_repeat,
          },
          {
            label: 'Topic variety',
            hint: 'Moves the post down when your feed already has posts on a similar topic.',
            multiplier: slot.topic_repeat,
          },
          {
            label: 'Same story',
            hint: 'Moves the post down when your feed already covers the same story.',
            multiplier: slot.same_headline,
          },
        ]
      : []),
  ];
  // A factor missing from an older record reads as 0, which explains nothing.
  const known = multipliers.filter(({ multiplier }) => multiplier > 0);
  const explained = known.reduce(
    (product, { multiplier }) => product * multiplier,
    1,
  );
  const recorded = slot?.pick_score ?? score;
  const finalScore = recorded > 0 ? recorded : explained;

  // The exploration draw and the fresh slot's own scale move the recorded
  // score without a factor of their own; the gap gets its row, past what
  // the factors' 3-decimal rounding leaves.
  const gap = finalScore / explained;
  const moved = [
    ...known,
    ...(Math.abs(Math.log(gap)) >= 0.01
      ? [
          {
            label: 'Other adjustments',
            hint: 'Everything else, like a bit of randomness and a spot saved for brand-new posts.',
            multiplier: gap,
          },
        ]
      : []),
  ].filter(hasEffect);

  return {
    factors: [
      ...moved.filter(({ multiplier }) => multiplier > 1),
      ...moved.filter(({ multiplier }) => multiplier < 1),
    ],
    unchanged: known.filter((factor) => !hasEffect(factor)),
    score: finalScore,
  };
};

export enum ExplanationMatchKind {
  Topic = 'topic',
  Source = 'source',
  Squad = 'squad',
  Author = 'author',
}

export interface ExplanationMatch {
  /** `kind:id`, so a match joins its row in the full explanation. */
  key: string;
  kind: ExplanationMatchKind;
  label: string;
  /** For a topic: main or supporting. */
  isMain?: boolean;
  /** Why it counts, finishing "and it is ...". */
  origin: string;
  /** How much it raised the score, in percent. */
  points: number;
}

export const getMatchKey = (kind: ExplanationMatchKind, id: string): string =>
  `${
    kind === ExplanationMatchKind.Squad ? ExplanationMatchKind.Source : kind
  }:${id}`;

const topicOrigin: Record<ExplainOrigin, string> = {
  [ExplainOrigin.Declared]: 'a topic you follow',
  [ExplainOrigin.Inferred]: 'close to what you read',
  [ExplainOrigin.Set]: 'a topic you gave a boost',
};

const toPoints = (factor: number): number => Math.round((factor - 1) * 100);

const levelOrigin: Partial<Record<FollowControl, string>> = {
  [FollowControl.Boost]: 'set to Show more',
  [FollowControl.Demote]: 'set to Show less',
  [FollowControl.Weight]: 'given an exact boost',
};

const getLevelOrigin = (control: FollowControl | undefined): string =>
  (control && levelOrigin[control]) || 'a level you set';

/**
 * What matched the reader, strongest first: the follow or the level set on
 * the source or author, and the best topic.
 */
export const getExplanationMatches = (
  post: Post,
  explain: RankedExplain,
): ExplanationMatch[] => {
  const { follow, match } = explain;
  const matches: ExplanationMatch[] = [];
  const side = getFollowSide(explain);
  if (side === FollowSide.Source && post.source?.id) {
    const isSquad = follow.kind
      ? follow.kind === ExplainFollowKind.Squad
      : post.source.type === SourceType.Squad;
    const kind = isSquad
      ? ExplanationMatchKind.Squad
      : ExplanationMatchKind.Source;
    let origin = getLevelOrigin(follow.source_control);
    if (follow.kind) {
      origin = isSquad ? "a squad you're in" : 'something you follow';
    }
    matches.push({
      key: getMatchKey(kind, post.source.id),
      kind,
      label: post.source.name ?? post.source.id,
      origin,
      points: toPoints(follow.factor),
    });
  }
  if (side === FollowSide.Author && post.author) {
    matches.push({
      key: getMatchKey(ExplanationMatchKind.Author, post.author.id),
      kind: ExplanationMatchKind.Author,
      label: getAuthorLabel(post.author),
      origin: follow.kind
        ? 'someone you follow'
        : getLevelOrigin(follow.author_control),
      points: toPoints(follow.factor),
    });
  }
  if (match) {
    matches.push({
      key: getMatchKey(ExplanationMatchKind.Topic, match.tag),
      kind: ExplanationMatchKind.Topic,
      label: match.tag,
      isMain: match.role === ExplainRole.Central,
      origin: topicOrigin[match.origin] ?? topicOrigin[ExplainOrigin.Inferred],
      points: toPoints(match.factor),
    });
  }

  return matches.sort((a, b) => b.points - a.points);
};
