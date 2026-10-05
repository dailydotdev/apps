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
import { publicApiUrl } from '../lib/config';

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
    slug?: string;
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
  /**
   * The public page the award is verified on, once the creator has shared
   * it. `null` while it is private to them — sharing is always their call.
   */
  shareUrl: string | null;
}

/**
 * An award as anyone with its link sees it.
 *
 * Deliberately without `measuredValue`: the creator's exact analytics never
 * leave their dashboard, and a shared milestone claims its `threshold` only.
 */
export type SharedCreatorAchievement = Omit<
  CreatorAchievement,
  'measuredValue'
> & {
  user: {
    id: string;
    name: string;
    username: string;
    image: string;
    permalink: string;
  };
};

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
    shareUrl
    post {
      id
      slug
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

/**
 * Public fields only, so it is safe to request anonymously — the evidence page
 * and the screenshotted share card both read this.
 */
export const SHARED_CREATOR_ACHIEVEMENT_QUERY = gql`
  query SharedCreatorAchievement($id: ID!) {
    sharedCreatorAchievement(id: $id) {
      id
      type
      achievedAt
      periodStart
      periodEnd
      threshold
      rank
      evidenceUrl
      isHistorical
      shareUrl
      user {
        id
        name
        username
        image
        permalink
      }
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
  }
`;

export type SharedCreatorAchievementData = {
  sharedCreatorAchievement: SharedCreatorAchievement | null;
};

/**
 * Anonymous by design: the evidence page and the card image are opened by
 * people without an account. Null means the award is not, or no longer, public.
 */
export const sharedCreatorAchievementQueryOptions = (id: string) => ({
  queryKey: generateQueryKey(
    RequestKey.SharedCreatorAchievement,
    undefined,
    id,
  ),
  queryFn: () =>
    gqlClient.request<SharedCreatorAchievementData>(
      SHARED_CREATOR_ACHIEVEMENT_QUERY,
      { id },
    ),
});

export const SHARE_CREATOR_ACHIEVEMENT_MUTATION = gql`
  mutation ShareCreatorAchievement($id: ID!) {
    shareCreatorAchievement(id: $id) {
      id
      shareUrl
    }
  }
`;

export const UNSHARE_CREATOR_ACHIEVEMENT_MUTATION = gql`
  mutation UnshareCreatorAchievement($id: ID!) {
    unshareCreatorAchievement(id: $id) {
      _
    }
  }
`;

/** Make an award public and get back the link it is verified on. */
export const shareCreatorAchievement = async (id: string): Promise<string> => {
  const { shareCreatorAchievement: shared } = await gqlClient.request<{
    shareCreatorAchievement: { id: string; shareUrl: string };
  }>(SHARE_CREATOR_ACHIEVEMENT_MUTATION, { id });

  // Non-null once shared, which the mutation just did.
  return shared.shareUrl;
};

export const unshareCreatorAchievement = async (id: string): Promise<void> => {
  await gqlClient.request(UNSHARE_CREATOR_ACHIEVEMENT_MUTATION, { id });
};

/**
 * The share card image for a shared award, rendered by the API's `/og` route
 * from the same public record the evidence page reads.
 *
 * Absolute by default, for Open Graph tags crawlers read. Pass `apiUrl` to
 * fetch it from the browser, where local development goes through the proxy.
 */
export const getCreatorAchievementCardUrl = (
  id: string,
  base: string | undefined = publicApiUrl,
): string => `${base}/og/achievements/${encodeURIComponent(id)}.png`;

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
