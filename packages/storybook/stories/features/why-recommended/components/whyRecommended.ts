import { SharedFeedPage } from '@dailydotdev/shared/src/components/utilities/common';
import { OtherFeedPage } from '@dailydotdev/shared/src/lib/query';

export enum RecommendationReason {
  FollowedAuthor = 'followed_author',
  FollowedSource = 'followed_source',
  SquadMember = 'squad_member',
  FollowedTags = 'followed_tags',
  Trending = 'trending',
  Personalized = 'personalized',
}

export enum RecommendationMatchKind {
  Topic = 'topic',
  Source = 'source',
  Squad = 'squad',
  Author = 'author',
}

export enum RecommendationMatchRole {
  Main = 'main',
  Supporting = 'supporting',
  Related = 'related',
}

export enum RecommendationMatchOrigin {
  Selected = 'selected',
  Following = 'following',
  Member = 'member',
  Reading = 'reading',
}

export interface RecommendationMatch {
  /** Tag name, source id or user id: joins the match to its row. */
  id: string;
  label: string;
  kind: RecommendationMatchKind;
  origin: RecommendationMatchOrigin;
  role?: RecommendationMatchRole;
  points?: number;
}

export interface RecommendationScoreFactor {
  label: string;
  value: number;
}

/**
 * Proposed per-post ranking explanation from the feed service. Nothing returns
 * it yet; without it the modal falls back to what the viewer follows.
 */
export interface RecommendationExplanation {
  matches: RecommendationMatch[];
  factors?: RecommendationScoreFactor[];
  finalScore?: number;
}

const trendingFeeds: string[] = [SharedFeedPage.Popular, OtherFeedPage.Explore];

export const isTrendingFeed = (feedName: string): boolean =>
  trendingFeeds.includes(feedName);

interface RecommendationSignals {
  feedName: string;
  isFollowingAuthor: boolean;
  isFollowingSource: boolean;
  isSquadMember: boolean;
  followedTags: string[];
  isTrending: boolean;
}

export const getRecommendationReason = ({
  feedName,
  isFollowingAuthor,
  isFollowingSource,
  isSquadMember,
  followedTags,
  isTrending,
}: RecommendationSignals): RecommendationReason => {
  if (isFollowingAuthor) {
    return RecommendationReason.FollowedAuthor;
  }

  if (isFollowingSource) {
    return RecommendationReason.FollowedSource;
  }

  if (isSquadMember) {
    return RecommendationReason.SquadMember;
  }

  if (followedTags.length > 0) {
    return RecommendationReason.FollowedTags;
  }

  if (isTrending || isTrendingFeed(feedName)) {
    return RecommendationReason.Trending;
  }

  return RecommendationReason.Personalized;
};

interface SignalMatchesProps {
  author?: { id: string; name: string | null };
  source: { id?: string; name?: string };
  isFollowingAuthor: boolean;
  isFollowingSource: boolean;
  isSquadMember: boolean;
  followedTags: string[];
}

export const getSignalMatches = ({
  author,
  source,
  isFollowingAuthor,
  isFollowingSource,
  isSquadMember,
  followedTags,
}: SignalMatchesProps): RecommendationMatch[] => [
  ...(isFollowingAuthor && author?.name
    ? [
        {
          id: author.id,
          label: author.name,
          kind: RecommendationMatchKind.Author,
          origin: RecommendationMatchOrigin.Following,
        },
      ]
    : []),
  ...(isFollowingSource && source.id && source.name
    ? [
        {
          id: source.id,
          label: source.name,
          kind: RecommendationMatchKind.Source,
          origin: RecommendationMatchOrigin.Following,
        },
      ]
    : []),
  ...(isSquadMember && source.id && source.name
    ? [
        {
          id: source.id,
          label: source.name,
          kind: RecommendationMatchKind.Squad,
          origin: RecommendationMatchOrigin.Member,
        },
      ]
    : []),
  ...followedTags.map((tag) => ({
    id: tag,
    label: tag,
    kind: RecommendationMatchKind.Topic,
    origin: RecommendationMatchOrigin.Selected,
  })),
];

interface MatchLabels {
  sentence: string;
  short: string;
}

const matchRoleLabels: Record<RecommendationMatchRole, MatchLabels> = {
  [RecommendationMatchRole.Main]: { sentence: 'main topic', short: 'Main' },
  [RecommendationMatchRole.Supporting]: {
    sentence: 'supporting topic',
    short: 'Supporting',
  },
  [RecommendationMatchRole.Related]: {
    sentence: 'closely related topic',
    short: 'Related',
  },
};

const matchKindLabels: Record<RecommendationMatchKind, MatchLabels> = {
  [RecommendationMatchKind.Topic]: { sentence: 'topic', short: 'Topic' },
  [RecommendationMatchKind.Source]: { sentence: 'source', short: 'Source' },
  [RecommendationMatchKind.Squad]: {
    sentence: 'squad',
    short: "Squad you're in",
  },
  [RecommendationMatchKind.Author]: { sentence: 'author', short: 'Author' },
};

const getMatchLabels = (match: RecommendationMatch): MatchLabels =>
  match.role ? matchRoleLabels[match.role] : matchKindLabels[match.kind];

export const getMatchKindLabel = (match: RecommendationMatch): string =>
  getMatchLabels(match).sentence;

export const getMatchMeta = (match: RecommendationMatch): string =>
  getMatchLabels(match).short;

const feedLabels: Record<string, string> = {
  [SharedFeedPage.MyFeed]: 'For You',
  [SharedFeedPage.Custom]: 'your custom feed',
  [SharedFeedPage.Popular]: 'Popular',
  [OtherFeedPage.Explore]: 'Explore',
  [OtherFeedPage.Following]: 'Following',
};

export const getFeedLabel = (feedName: string): string =>
  feedLabels[feedName] ?? 'your feed';

export const sortMatchesByPoints = (
  matches: RecommendationMatch[],
): RecommendationMatch[] =>
  [...matches].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

const matchOriginPhrase: Record<RecommendationMatchOrigin, string> = {
  [RecommendationMatchOrigin.Selected]: 'an interest you selected',
  [RecommendationMatchOrigin.Following]: 'something you follow',
  [RecommendationMatchOrigin.Member]: "a squad you're in",
  [RecommendationMatchOrigin.Reading]: 'close to what you read',
};

export const getMatchOriginPhrase = (match: RecommendationMatch): string =>
  matchOriginPhrase[match.origin];
