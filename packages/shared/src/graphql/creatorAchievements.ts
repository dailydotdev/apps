import { gql } from 'graphql-request';
import type { Connection } from './common';
import { gqlClient } from './common';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../lib/query';
import type { LoggedUser } from '../lib/user';

export enum CreatorAchievementType {
  CategoryRanking = 'category_ranking',
  PostUpvoteMilestone = 'post_upvote_milestone',
  CreatorImpressionMilestone = 'creator_impression_milestone',
}

/**
 * One award a creator earned, as the server recorded it.
 *
 * Render from these fields rather than recomputing anything: the same record
 * is what a notification, an email and a share card will read, and a number
 * derived here would be the one place they could disagree.
 */
export interface CreatorAchievement {
  id: string;
  type: CreatorAchievementType;
  /**
   * When it was earned. For a backfilled award this is the historical date,
   * so it is what history should be ordered and labelled by.
   */
  achievedAt: string;
  /**
   * `null` only for creator-wide types such as
   * `CreatorImpressionMilestone`. A per-article award whose article is gone is
   * withheld by the server rather than returned with a null `post`, so a null
   * here on a per-article type is a bug, not a state to design a card for.
   */
  post: {
    id: string;
    title: string | null;
    commentsPermalink: string;
  } | null;
  /** `null` for awards that are not category-scoped. */
  keyword: {
    value: string;
    flags: { title: string | null } | null;
  } | null;
  periodStart: string | null;
  periodEnd: string | null;
  /** What the award claims, for milestones — not the creator's real total. */
  threshold: number | null;
  /** 1-based placement, for ranking awards. */
  rank: number | null;
  /**
   * The measured value behind a milestone.
   *
   * The creator's own analytics. Fine on their dashboard; keep it off
   * anything shared publicly, which is what `threshold` is for.
   */
  measuredValue: number | null;
  /** A public page the award can be verified on, when it has one. */
  evidenceUrl: string | null;
  /**
   * Backfilled from history rather than earned live. Shown like any other
   * award; it just never triggered a notification.
   */
  isHistorical: boolean;
}

export const CREATOR_ACHIEVEMENT_FRAGMENT = gql`
  fragment CreatorAchievementFragment on CreatorAchievement {
    id
    type
    achievedAt
    periodStart
    periodEnd
    threshold
    rank
    measuredValue
    evidenceUrl
    isHistorical
    post {
      id
      title
      commentsPermalink
    }
    keyword {
      value
      flags {
        title
      }
    }
  }
`;

export const CREATOR_ACHIEVEMENTS_QUERY = gql`
  query CreatorAchievements($after: String, $first: Int) {
    creatorAchievements(after: $after, first: $first) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...CreatorAchievementFragment
        }
      }
    }
  }
  ${CREATOR_ACHIEVEMENT_FRAGMENT}
`;

export const creatorAchievementsPageSize = 20;

/** Spread into `useInfiniteQuery`; the server caps `first` at 50. */
export const creatorAchievementsQueryOptions = ({
  user,
  first = creatorAchievementsPageSize,
}: {
  user: Pick<LoggedUser, 'id'> | null | undefined;
  first?: number;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.CreatorAchievements,
    user ?? undefined,
    { first },
  ),
  queryFn: async ({ pageParam }: { pageParam?: string }) => {
    const { creatorAchievements } = await gqlClient.request<{
      creatorAchievements: Connection<CreatorAchievement>;
    }>(CREATOR_ACHIEVEMENTS_QUERY, { after: pageParam, first });

    return creatorAchievements;
  },
  initialPageParam: '',
  getNextPageParam: (lastPage: Connection<CreatorAchievement>) =>
    getNextPageParam(lastPage?.pageInfo),
  enabled: !!user,
  staleTime: StaleTime.Default,
});
