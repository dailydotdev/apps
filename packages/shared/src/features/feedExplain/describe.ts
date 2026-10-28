import type { Post } from '../../graphql/posts';
import { isSourceUserSource } from '../../graphql/sources';
import type { FeedItemExplain, RankedExplain } from './types';
import {
  ExplainFollowKind,
  ExplainOrigin,
  ExplainRole,
  ExplainStrength,
  isRankedExplain,
} from './types';

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

const getCategory = (
  explain: FeedItemExplain | null | undefined,
): ReasonCategory => {
  if (isFillIn(explain)) {
    return ReasonCategory.FillIn;
  }
  if (!isRankedExplain(explain)) {
    return ReasonCategory.Followed;
  }
  if (explain.follow.kind) {
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
}

export interface ExplainSignal {
  kind: ExplainSignalKind;
  /** The tag or the source id. */
  id: string;
  label: string;
}

/**
 * The rows a card lists: its topics, the one that matched first, and its
 * source, first when a follow brought the card in.
 */
export const getExplainSignals = (
  post: Post,
  explain: FeedItemExplain | null | undefined,
  limit: number,
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
  const { source } = post;
  if (!source?.id || isSourceUserSource(source)) {
    return topics.slice(0, limit);
  }
  const sourceSignal: ExplainSignal = {
    kind: ExplainSignalKind.Source,
    id: source.id,
    label: source.name ?? source.id,
  };
  const otherTopics = topics.slice(0, Math.max(0, limit - 1));
  return isRankedExplain(explain) && isSourceFollow(explain)
    ? [sourceSignal, ...otherTopics]
    : [...otherTopics, sourceSignal];
};

export interface ScoreFactor {
  label: string;
  /** What the factor measures, for its tooltip. */
  hint: string;
  value: number;
}

const round = (value: number): number => Math.round(value * 1000) / 1000;

/**
 * Each multiplier of the card's score on a log scale, so they add up to the
 * log of its pick score: above 0 raised the card, below 0 lowered it.
 */
export const getScoreBreakdown = (
  explain: RankedExplain,
): { factors: ScoreFactor[]; finalScore: number } => {
  const { score, base, match, follow, age, seen, slot } = explain;
  const multipliers: ScoreFactor[] = [
    {
      label: 'Engagement',
      hint: 'How much other readers clicked, upvoted, and commented on this post, compared with a typical post.',
      value: base.value,
    },
    {
      label: 'Topic match',
      hint: 'How close the post is to the topics you follow and read.',
      value: match?.factor ?? 1,
    },
    {
      label: 'Follow',
      hint: 'A boost when you follow its source, squad, or author.',
      value: follow.factor,
    },
    {
      label: 'Freshness',
      hint: 'Newer posts score higher, and older ones slowly fade.',
      value: age.factor,
    },
    {
      label: 'Seen before',
      hint: "Moves the post down if you've already seen it in your feed.",
      value: seen.factor,
    },
    ...(slot
      ? [
          {
            label: "Topic's turn",
            hint: "A boost when a topic you like hasn't been in your feed for a while.",
            value: slot.waiting,
          },
          {
            label: 'Source variety',
            hint: 'Moves the post down when your feed already has posts from the same source.',
            value: slot.source_repeat,
          },
          {
            label: 'Topic variety',
            hint: 'Moves the post down when your feed already has posts on a similar topic.',
            value: slot.topic_repeat,
          },
          {
            label: 'Same story',
            hint: 'Moves the post down when your feed already covers the same story.',
            value: slot.same_headline,
          },
        ]
      : []),
  ];
  // A factor missing from an older record reads as 0, which explains nothing.
  const factors = multipliers
    .filter(({ value }) => value > 0)
    .map((factor) => ({ ...factor, value: round(Math.log(factor.value)) }));
  const explained = round(factors.reduce((sum, { value }) => sum + value, 0));
  const recorded = slot?.pick_score ?? score;
  if (!(recorded > 0)) {
    return { factors, finalScore: explained };
  }

  // The exploration draw and the fresh slot's own scale move the recorded
  // score without a factor of their own; the gap gets its row.
  const finalScore = round(Math.log(recorded));
  const gap = round(finalScore - explained);

  return {
    factors:
      Math.abs(gap) >= 0.01
        ? [
            ...factors,
            {
              label: 'Other adjustments',
              hint: 'Everything else, like a bit of randomness and a spot saved for brand-new posts.',
              value: gap,
            },
          ]
        : factors,
    finalScore,
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

/** What matched the reader, strongest first: the follow and the best topic. */
export const getExplanationMatches = (
  post: Post,
  explain: RankedExplain,
): ExplanationMatch[] => {
  const { follow, match } = explain;
  const matches: ExplanationMatch[] = [];
  if (isSourceFollow(explain) && post.source?.id) {
    const isSquad = follow.kind === ExplainFollowKind.Squad;
    const kind = isSquad
      ? ExplanationMatchKind.Squad
      : ExplanationMatchKind.Source;
    matches.push({
      key: getMatchKey(kind, post.source.id),
      kind,
      label: post.source.name ?? post.source.id,
      origin: isSquad ? "a squad you're in" : 'something you follow',
      points: toPoints(follow.factor),
    });
  }
  if (follow.kind === ExplainFollowKind.Author && post.author) {
    matches.push({
      key: getMatchKey(ExplanationMatchKind.Author, post.author.id),
      kind: ExplanationMatchKind.Author,
      label: post.author.name || `@${post.author.username}`,
      origin: 'someone you follow',
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
