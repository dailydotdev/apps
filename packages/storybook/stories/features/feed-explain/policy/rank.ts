import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import type { ParamValues } from './params';
import type { Interest, TopicControl, TopicEvidence } from './profile';
import { buildInterests, getActiveInterests, InterestOrigin } from './profile';

/**
 * A client-side copy of daily-feed's challenger/5.0 policy (`policy/gate.go`,
 * `score.go`, `pick.go`), run over the posts in the story so every number on
 * a card comes from the same math the feed uses. Simplified where the real
 * inputs aren't in the story: reader response compares each post's
 * reactions per view with the other posts here, the first tag is the main
 * topic, topic similarity is tag overlap instead of tag embeddings, and
 * placement swaps are left out.
 */

export enum SourceMode {
  Demoted = 'demoted',
}

export interface PersonalizationState {
  followedTags: string[];
  blockedTags: string[];
  followedSources: string[];
  blockedSources: string[];
  followedAuthors: string[];
  blockedAuthors: string[];
  evidence: TopicEvidence[];
  isLearning: boolean;
  controls: Record<string, TopicControl>;
  sourceControls: Record<string, SourceMode>;
  /** An exact boost the user set for a source, replacing follow and Less. */
  sourceWeights?: Record<string, number>;
  params: ParamValues;
  isFillingWithPopular: boolean;
  hidden: string[];
  /** Views without an action, per post. */
  impressions: Record<string, number>;
  /** Days since each topic was the main topic on your first screen. */
  tagShownDays: Record<string, number>;
}

export enum Lane {
  Challenger = 'chal',
  Popular = 'po',
}

export enum Exclusion {
  Hidden = 'hidden',
  BlockedSource = 'blocked_source',
  BlockedAuthor = 'blocked_author',
  BlockedTag = 'blocked_tag',
  TooOld = 'older_than_max_age',
  ShownTooOften = 'shown_too_often_without_action',
  NoInterestOrFollow = 'no_interest_or_follow',
  SideTopicUnproven = 'side_topic_on_an_unproven_post',
  SideTopicsOff = 'side_topics_off',
  PopularFillOff = 'popular_fill_off',
  BelowThePage = 'below_the_page',
}

export enum TopicRole {
  Main = 'main',
  Side = 'side',
}

export interface Match {
  tag: string;
  origin: InterestOrigin;
  role: TopicRole;
  weight: number;
  roleWeight: number;
  contribution: number;
}

export enum FollowKind {
  Source = 'source',
  Author = 'author',
}

export interface ScoreFactors {
  base: number;
  match: number;
  follow: number;
  age: number;
  seen: number;
}

export interface SlotFactors {
  sourceRepeat: number;
  sourceCount: number;
  topicRepeat: number;
  similarAbove: number;
  sameHeadline: number;
  waiting: number;
  waitingTag?: string;
}

export interface Decision {
  post: Post;
  lane: Lane;
  exclusion?: Exclusion;
  /** The tag behind a blocked_tag exclusion. */
  exclusionTag?: string;
  followedBy?: FollowKind;
  sourceMode?: SourceMode;
  best?: Match;
  matches: Match[];
  ageDays: number;
  impressions: number;
  earned: number;
  factors: ScoreFactors;
  score: number;
  slot?: SlotFactors;
  pickScore?: number;
  /** 1-based place on the page. */
  position?: number;
  /** 1-based place among every eligible post, before page variety. */
  eligibleRank?: number;
}

export interface RankResult {
  served: Decision[];
  leftOut: Decision[];
  interests: Interest[];
}

export const pageSize = 12;
const firstScreenSize = 8;
const topicSimilarityFloor = 0.35;
const sameHeadlineJaccard = 0.35;
const proofFloor = 0.2;
const dayMs = 86_400_000;
/** The day the posts in the story were captured. */
export const storyNow = Date.parse('2026-10-15T12:00:00Z');

const stopWords = new Set([
  'the',
  'and',
  'for',
  'you',
  'your',
  'with',
  'how',
  'why',
  'this',
  'that',
  'are',
  'was',
  'not',
  'just',
]);

const titleTokens = (title = ''): Set<string> =>
  new Set(
    title
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .filter((word) => word.length >= 3 && !stopWords.has(word)),
  );

const jaccard = (a: Set<string>, b: Set<string>): number => {
  const shared = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return union ? shared / union : 0;
};

const tagSimilarity = (a: string[], b: string[]): number => {
  if (!a.length || !b.length) {
    return 0;
  }
  const shared = a.filter((tag) => b.includes(tag)).length;
  return shared / Math.sqrt(a.length * b.length);
};

const reactionRate = (post: Post): number =>
  (2 * (post.numUpvotes ?? 0) + 2 * (post.numComments ?? 0)) /
  Math.max(1, post.analytics?.impressions ?? 1);

const medianRates = new WeakMap<Post[], number>();

const getMedianRate = (pool: Post[]): number => {
  const cached = medianRates.get(pool);
  if (cached !== undefined) {
    return cached;
  }
  const rates = pool.map(reactionRate).sort((a, b) => a - b);
  const median = rates[Math.floor(rates.length / 2)] || 1;
  medianRates.set(pool, median);
  return median;
};

export const getMainTopic = (post: Post): string | undefined => post.tags?.[0];

interface Context {
  state: PersonalizationState;
  interests: Map<string, Interest>;
  medianRate: number;
  now: number;
}

const assess = (post: Post, context: Context): Decision => {
  const { state, interests, medianRate, now } = context;
  const { params } = state;
  const tags = post.tags ?? [];
  const sourceId = post.source?.id ?? '';
  const authorId = post.author?.id;
  const base = Math.max(0.02, reactionRate(post) / medianRate);
  const earned = Math.max(0, base - 0.5);
  const ageDays = Math.max(
    0,
    (now - Date.parse(post.createdAt ?? '')) / dayMs || 0,
  );
  const impressions = state.impressions[post.id] ?? 0;
  const matches = tags
    .map((tag, index): Match | undefined => {
      const interest = interests.get(tag);
      if (!interest) {
        return undefined;
      }
      const role = index === 0 ? TopicRole.Main : TopicRole.Side;
      const roleWeight =
        role === TopicRole.Main ? 1 : params['relevance.side_topic_weight'];
      return {
        tag,
        origin: interest.origin,
        role,
        weight: interest.weight,
        roleWeight,
        contribution: interest.weight * roleWeight,
      };
    })
    .filter((match): match is Match => !!match && match.roleWeight > 0)
    .sort((a, b) => b.contribution - a.contribution);
  const best = matches[0];
  const isSourceFollowed = state.followedSources.includes(sourceId);
  const isAuthorFollowed =
    !!authorId && state.followedAuthors.includes(authorId);
  const sourceFollow = isSourceFollowed
    ? params['follows.source_multiplier']
    : 1;
  const authorFollow = isAuthorFollowed
    ? params['follows.author_multiplier']
    : 1;
  let followedBy: FollowKind | undefined;
  if (isSourceFollowed || isAuthorFollowed) {
    followedBy =
      sourceFollow >= authorFollow ? FollowKind.Source : FollowKind.Author;
  }
  const sourceMode = state.sourceControls[sourceId];
  const sourceWeight = state.sourceWeights?.[sourceId];
  let follow =
    Math.max(sourceFollow, authorFollow) *
    (sourceMode === SourceMode.Demoted
      ? params['interests.control_demote']
      : 1);
  if (sourceWeight !== undefined) {
    follow = isAuthorFollowed
      ? Math.max(sourceWeight, authorFollow)
      : sourceWeight;
  }
  const factors: ScoreFactors = {
    base,
    match: 1 + (best?.contribution ?? 0),
    follow,
    age:
      0.5 **
      (ageDays /
        (params['age.half_life_days'] *
          Math.min(params['age.max_stretch'], Math.max(1, base)))),
    seen: params['history.seen_factor_per_show'] ** impressions,
  };
  const decision: Decision = {
    post,
    lane: Lane.Challenger,
    followedBy,
    sourceMode,
    best,
    matches,
    ageDays,
    impressions,
    earned,
    factors,
    score:
      factors.base * factors.match * factors.follow * factors.age * factors.seen,
  };
  const exclude = (exclusion: Exclusion, exclusionTag?: string): Decision => ({
    ...decision,
    exclusion,
    exclusionTag,
  });
  const blockedTag = tags.find((tag) => state.blockedTags.includes(tag));

  if (state.hidden.includes(post.id)) {
    return exclude(Exclusion.Hidden);
  }
  if (state.blockedSources.includes(sourceId)) {
    return exclude(Exclusion.BlockedSource);
  }
  if (authorId && state.blockedAuthors.includes(authorId)) {
    return exclude(Exclusion.BlockedAuthor);
  }
  if (blockedTag) {
    return exclude(Exclusion.BlockedTag, blockedTag);
  }
  if (ageDays > params['feed.max_candidate_age_days']) {
    return exclude(Exclusion.TooOld);
  }
  if (impressions >= params['history.max_impressions_without_action']) {
    return exclude(Exclusion.ShownTooOften);
  }
  if (!followedBy && !matches.length) {
    const hasSideOnly =
      params['relevance.side_topic_weight'] === 0 &&
      tags.slice(1).some((tag) => interests.has(tag));
    return exclude(
      hasSideOnly ? Exclusion.SideTopicsOff : Exclusion.NoInterestOrFollow,
    );
  }
  if (
    !followedBy &&
    !matches.some(({ role }) => role === TopicRole.Main) &&
    earned <= proofFloor
  ) {
    return exclude(Exclusion.SideTopicUnproven);
  }
  return decision;
};

const createContext = (
  pool: Post[],
  state: PersonalizationState,
  now: number,
): Context & { allInterests: Interest[] } => {
  const allInterests = buildInterests({
    followedTags: state.followedTags,
    blockedTags: state.blockedTags,
    evidence: state.evidence,
    controls: state.controls,
    isLearning: state.isLearning,
    params: state.params,
  });

  return {
    state,
    allInterests,
    interests: new Map(
      getActiveInterests(allInterests).map((interest) => [
        interest.tag,
        interest,
      ]),
    ),
    medianRate: getMedianRate(pool),
    now,
  };
};

const fillableExclusions = [
  Exclusion.NoInterestOrFollow,
  Exclusion.SideTopicUnproven,
  Exclusion.SideTopicsOff,
];

/** Why a post on screen would not come back, under the current state. */
export const getExclusion = (
  served: Decision,
  pool: Post[],
  state: PersonalizationState,
  now = storyNow,
): Decision | undefined => {
  const decision = assess(served.post, createContext(pool, state, now));
  if (served.lane === Lane.Popular) {
    if (decision.exclusion && fillableExclusions.includes(decision.exclusion)) {
      return state.isFillingWithPopular
        ? undefined
        : { ...decision, exclusion: Exclusion.PopularFillOff };
    }
  }
  return decision.exclusion ? decision : undefined;
};

export const rankFeed = (
  pool: Post[],
  state: PersonalizationState,
  now = storyNow,
): RankResult => {
  const context = createContext(pool, state, now);
  const { params } = state;
  const assessed = pool.map((post) => assess(post, context));
  const eligible = assessed
    .filter(({ exclusion }) => !exclusion)
    .sort((a, b) => b.score - a.score)
    .map((decision, index) => ({ ...decision, eligibleRank: index + 1 }));
  const rotation = getActiveInterests(context.allInterests)
    .filter(({ isBacked }) => isBacked)
    .map(({ tag, weight }) => ({
      tag,
      evidence: Math.min(1, weight - params['interests.base_weight']),
    }))
    .filter(({ evidence }) => evidence > 0);
  const maxEvidence = Math.max(0, ...rotation.map(({ evidence }) => evidence));
  const evidenceByTag = new Map(
    rotation.map(({ tag, evidence }) => [tag, evidence / maxEvidence]),
  );
  const tookTurn = new Set<string>();
  const sourceCounts = new Map<string, number>();
  const served: Decision[] = [];
  let remaining = eligible;

  const slotFor = (decision: Decision): SlotFactors => {
    const { post } = decision;
    const sourceCount = sourceCounts.get(post.source?.id ?? '') ?? 0;
    const similarity = served.slice(-50).reduce((sum, picked) => {
      const cos = tagSimilarity(post.tags ?? [], picked.post.tags ?? []);
      return (
        sum +
        Math.min(
          1,
          Math.max(0, (cos - topicSimilarityFloor) / (1 - topicSimilarityFloor)),
        )
      );
    }, 0);
    const tokens = titleTokens(post.title);
    const isSameHeadline = served.some(
      (picked) =>
        jaccard(tokens, titleTokens(picked.post.title)) >= sameHeadlineJaccard,
    );
    const mainTopic = getMainTopic(post);
    const evidence =
      mainTopic && !tookTurn.has(mainTopic)
        ? evidenceByTag.get(mainTopic)
        : undefined;
    let waiting = 1;
    if (evidence !== undefined) {
      const shownDays = state.tagShownDays[mainTopic ?? ''];
      const wait =
        shownDays === undefined
          ? 1
          : 1 - 0.5 ** (shownDays / params['diversity.waiting_half_life_days']);
      waiting =
        1 +
        params['diversity.waiting_interest_lift'] *
          wait *
          Math.max(evidence, Math.min(1, decision.factors.base));
    }
    return {
      sourceCount,
      sourceRepeat:
        (1 - params['diversity.source_repeat_discount']) ** sourceCount,
      similarAbove: similarity,
      topicRepeat: (1 - params['diversity.topic_repeat_discount']) ** similarity,
      sameHeadline: isSameHeadline
        ? 1 - params['diversity.same_headline_discount']
        : 1,
      waiting,
      waitingTag: waiting > 1 ? mainTopic : undefined,
    };
  };

  while (served.length < pageSize && remaining.length) {
    const scored = remaining.map((decision) => {
      const slot = slotFor(decision);
      return {
        ...decision,
        slot,
        pickScore:
          decision.score *
          slot.sourceRepeat *
          slot.topicRepeat *
          slot.sameHeadline *
          slot.waiting,
      };
    });
    const next = scored.reduce((top, decision) =>
      (decision.pickScore ?? 0) > (top.pickScore ?? 0) ? decision : top,
    );
    served.push({ ...next, position: served.length + 1 });
    const sourceId = next.post.source?.id ?? '';
    sourceCounts.set(sourceId, (sourceCounts.get(sourceId) ?? 0) + 1);
    if (next.slot?.waitingTag) {
      tookTurn.add(next.slot.waitingTag);
    }
    remaining = remaining.filter(({ post }) => post.id !== next.post.id);
  }

  // The challenger only fills what it can; the popular lane tops up the rest.
  const fillable = assessed.filter(
    ({ exclusion }) => exclusion && fillableExclusions.includes(exclusion),
  );
  const fill =
    state.isFillingWithPopular && served.length < pageSize
      ? [...fillable]
          .sort(
            (a, b) => b.factors.base * b.factors.age - a.factors.base * a.factors.age,
          )
          .slice(0, pageSize - served.length)
      : [];
  fill.forEach((decision) =>
    served.push({
      ...decision,
      exclusion: undefined,
      lane: Lane.Popular,
      position: served.length + 1,
    }),
  );

  const servedIds = new Set(served.map(({ post }) => post.id));
  const leftOut = [
    ...remaining.map((decision) => ({
      ...decision,
      exclusion: Exclusion.BelowThePage,
    })),
    ...assessed.filter(
      ({ exclusion, post }) => exclusion && !servedIds.has(post.id),
    ),
  ];

  return { served, leftOut, interests: context.allInterests };
};

export const firstScreen = (decisions: Decision[]): Decision[] =>
  decisions.slice(0, firstScreenSize);
