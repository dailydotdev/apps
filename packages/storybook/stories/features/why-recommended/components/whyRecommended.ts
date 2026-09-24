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

const recommendationFeeds: string[] = [
  SharedFeedPage.MyFeed,
  SharedFeedPage.Custom,
  SharedFeedPage.Popular,
  OtherFeedPage.Explore,
  OtherFeedPage.Following,
];

const trendingFeeds: string[] = [SharedFeedPage.Popular, OtherFeedPage.Explore];

export const isTrendingFeed = (feedName: string): boolean =>
  trendingFeeds.includes(feedName);

export const isRecommendationFeed = (feedName?: string): boolean =>
  !!feedName && recommendationFeeds.includes(feedName);

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
  authorName: string | null;
  sourceName: string;
  isFollowingAuthor: boolean;
  isFollowingSource: boolean;
  isSquadMember: boolean;
  followedTags: string[];
}

export const getSignalMatches = ({
  authorName,
  sourceName,
  isFollowingAuthor,
  isFollowingSource,
  isSquadMember,
  followedTags,
}: SignalMatchesProps): RecommendationMatch[] => [
  ...(isFollowingAuthor && authorName
    ? [
        {
          label: authorName,
          kind: RecommendationMatchKind.Author,
          origin: RecommendationMatchOrigin.Following,
        },
      ]
    : []),
  ...(isFollowingSource
    ? [
        {
          label: sourceName,
          kind: RecommendationMatchKind.Source,
          origin: RecommendationMatchOrigin.Following,
        },
      ]
    : []),
  ...(isSquadMember
    ? [
        {
          label: sourceName,
          kind: RecommendationMatchKind.Squad,
          origin: RecommendationMatchOrigin.Member,
        },
      ]
    : []),
  ...followedTags.map((tag) => ({
    label: tag,
    kind: RecommendationMatchKind.Topic,
    origin: RecommendationMatchOrigin.Selected,
  })),
];

const matchRoleLabel: Record<RecommendationMatchRole, string> = {
  [RecommendationMatchRole.Main]: 'main topic',
  [RecommendationMatchRole.Supporting]: 'supporting topic',
  [RecommendationMatchRole.Related]: 'closely related topic',
};

const matchKindLabel: Record<RecommendationMatchKind, string> = {
  [RecommendationMatchKind.Topic]: 'topic',
  [RecommendationMatchKind.Source]: 'source',
  [RecommendationMatchKind.Squad]: 'squad',
  [RecommendationMatchKind.Author]: 'author',
};

export const getMatchKindLabel = (match: RecommendationMatch): string =>
  match.role ? matchRoleLabel[match.role] : matchKindLabel[match.kind];

const matchMetaLabel: Record<RecommendationMatchRole, string> = {
  [RecommendationMatchRole.Main]: 'Main',
  [RecommendationMatchRole.Supporting]: 'Supporting',
  [RecommendationMatchRole.Related]: 'Related',
};

const matchKindMetaLabel: Record<RecommendationMatchKind, string> = {
  [RecommendationMatchKind.Topic]: 'Topic',
  [RecommendationMatchKind.Source]: 'Source',
  [RecommendationMatchKind.Squad]: "Squad you're in",
  [RecommendationMatchKind.Author]: 'Author',
};

export const getMatchMeta = (match: RecommendationMatch): string =>
  match.role ? matchMetaLabel[match.role] : matchKindMetaLabel[match.kind];

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
