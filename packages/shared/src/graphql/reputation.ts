import { gql } from 'graphql-request';
import { subDays } from 'date-fns';
import type { Connection } from './common';
import { gqlClient } from './common';
import {
  generateQueryKey,
  getNextPageParam,
  RequestKey,
  StaleTime,
} from '../lib/query';
import type { LoggedUser } from '../lib/user';

export enum ReputationReason {
  PostUpvoted = 'post_upvoted',
  PostDownvoted = 'post_downvoted',
  PostBanned = 'post_banned',
  CommentUpvoted = 'comment_upvoted',
  CommentDownvoted = 'comment_downvoted',
  PostReportConfirmed = 'post_report_confirmed',
  SourceRequestApproved = 'source_request_approved',
  StreakRestored = 'streak_recover',
  StreakRestoredForFree = 'streak_recover_for_free',
  RestoredAfterReview = 'unvordr',
  Manual = '$$$',
  ManualLegacy = 'manual',
}

export enum ReputationTargetType {
  Post = 'post',
  Comment = 'comment',
  Source = 'source',
}

export enum ReputationPeriod {
  Last30Days = 'LAST_30_DAYS',
  Last90Days = 'LAST_90_DAYS',
  LastYear = 'LAST_YEAR',
  AllTime = 'ALL_TIME',
}

export enum ReputationEventFilter {
  All = 'ALL',
  Gains = 'GAINS',
  Losses = 'LOSSES',
}

export interface ReputationTarget {
  id: string;
  type: ReputationTargetType;
  /** Post title, the post a comment was left on, or the source name. */
  title: string;
  permalink: string;
}

export interface ReputationHistoryPoint {
  /** `YYYY-MM-DD`, UTC. */
  date: string;
  gained: number;
  lost: number;
  /** Reputation at the end of the day. */
  balance: number;
}

export interface ReputationReasonTotal {
  reason: ReputationReason;
  amount: number;
  count: number;
}

export interface ReputationTopSource {
  /** `null` when the post, comment or source no longer exists. */
  target: ReputationTarget | null;
  amount: number;
  /** Upvotes received, `null` for targets that are not voted on. */
  upvotes: number | null;
  /** Upvotes that granted reputation, only from members with 250+. */
  countedUpvotes: number | null;
}

export interface ReputationEvent {
  id: string;
  reason: ReputationReason;
  amount: number;
  createdAt: string;
  /** `null` when the post, comment or source no longer exists. */
  target: ReputationTarget | null;
}

export interface ReputationOverview {
  reputation: number;
  /** Net change inside the selected period. */
  periodChange: number;
  /**
   * Reputation the event log cannot itemize: the starting balance and
   * anything earned before events were recorded.
   */
  untracked: number;
  /** Date of the first recorded event, `null` when there is none. */
  trackedSince: string | null;
  /** Daily up to 90 days, weekly for a year, monthly for all time. */
  history: ReputationHistoryPoint[];
  breakdown: ReputationReasonTotal[];
}

const REPUTATION_TARGET_FRAGMENT = gql`
  fragment ReputationTargetFragment on ReputationTarget {
    id
    type
    title
    permalink
  }
`;

export const REPUTATION_OVERVIEW_QUERY = gql`
  query ReputationOverview($period: ReputationPeriod) {
    reputationOverview(period: $period) {
      reputation
      periodChange
      untracked
      trackedSince
      history {
        date
        gained
        lost
        balance
      }
      breakdown {
        reason
        amount
        count
      }
    }
  }
`;

export const REPUTATION_TOP_SOURCES_QUERY = gql`
  query ReputationTopSources($limit: Int) {
    reputationTopSources(limit: $limit) {
      amount
      upvotes
      countedUpvotes
      target {
        ...ReputationTargetFragment
      }
    }
  }
  ${REPUTATION_TARGET_FRAGMENT}
`;

export const REPUTATION_EVENTS_QUERY = gql`
  query ReputationEvents(
    $after: String
    $first: Int
    $filter: ReputationEventFilter
  ) {
    reputationEvents(after: $after, first: $first, filter: $filter) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          reason
          amount
          createdAt
          target {
            ...ReputationTargetFragment
          }
        }
      }
    }
  }
  ${REPUTATION_TARGET_FRAGMENT}
`;

type ReputationUser = Pick<LoggedUser, 'id'> | null | undefined;

export const reputationOverviewQueryOptions = ({
  user,
  period = ReputationPeriod.Last30Days,
}: {
  user: ReputationUser;
  period?: ReputationPeriod;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.ReputationOverview,
    user ?? undefined,
    period,
  ),
  queryFn: async () => {
    const { reputationOverview } = await gqlClient.request<{
      reputationOverview: ReputationOverview;
    }>(REPUTATION_OVERVIEW_QUERY, { period });

    return reputationOverview;
  },
  enabled: !!user,
  staleTime: StaleTime.Default,
});

export const reputationTopSourcesLimit = 5;

export const reputationTopSourcesQueryOptions = ({
  user,
}: {
  user: ReputationUser;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.ReputationTopSources,
    user ?? undefined,
  ),
  queryFn: async () => {
    const { reputationTopSources } = await gqlClient.request<{
      reputationTopSources: ReputationTopSource[];
    }>(REPUTATION_TOP_SOURCES_QUERY, { limit: reputationTopSourcesLimit });

    return reputationTopSources;
  },
  enabled: !!user,
  staleTime: StaleTime.Default,
});

export const reputationEventsPageSize = 20;

/** Spread into `useInfiniteQuery`. */
export const reputationEventsQueryOptions = ({
  user,
  filter = ReputationEventFilter.All,
}: {
  user: ReputationUser;
  filter?: ReputationEventFilter;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.ReputationEvents,
    user ?? undefined,
    filter,
  ),
  queryFn: async ({ pageParam }: { pageParam?: string }) => {
    const { reputationEvents } = await gqlClient.request<{
      reputationEvents: Connection<ReputationEvent>;
    }>(REPUTATION_EVENTS_QUERY, {
      after: pageParam,
      first: reputationEventsPageSize,
      filter,
    });

    return reputationEvents;
  },
  initialPageParam: '',
  getNextPageParam: (lastPage: Connection<ReputationEvent>) =>
    getNextPageParam(lastPage?.pageInfo),
  enabled: !!user,
  staleTime: StaleTime.Default,
});

/** The newest gain, which is what earned the first reputation moment. */
export const latestReputationGainQueryOptions = ({
  user,
}: {
  user: ReputationUser;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.ReputationEvents,
    user ?? undefined,
    ReputationEventFilter.Gains,
    'latest',
  ),
  queryFn: async () => {
    const { reputationEvents } = await gqlClient.request<{
      reputationEvents: Connection<ReputationEvent>;
    }>(REPUTATION_EVENTS_QUERY, {
      first: 1,
      filter: ReputationEventFilter.Gains,
    });

    return reputationEvents.edges[0]?.node ?? null;
  },
  enabled: !!user,
  staleTime: StaleTime.Default,
});

export const recentReputationGainsWindowDays = 7;

/**
 * Reputation gained in the last week, for when there is no count the member
 * last saw to compare against.
 */
export const recentReputationGainsQueryOptions = ({
  user,
  enabled = true,
}: {
  user: ReputationUser;
  enabled?: boolean;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.ReputationEvents,
    user ?? undefined,
    ReputationEventFilter.Gains,
    'recent',
  ),
  queryFn: async () => {
    const { reputationEvents } = await gqlClient.request<{
      reputationEvents: Connection<ReputationEvent>;
    }>(REPUTATION_EVENTS_QUERY, {
      first: reputationEventsPageSize,
      filter: ReputationEventFilter.Gains,
    });
    const since = subDays(new Date(), recentReputationGainsWindowDays);

    return reputationEvents.edges.reduce(
      (total, { node }) =>
        new Date(node.createdAt) > since ? total + node.amount : total,
      0,
    );
  },
  enabled: !!user && enabled,
  staleTime: StaleTime.Default,
});
