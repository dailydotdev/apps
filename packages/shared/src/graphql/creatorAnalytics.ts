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

export enum CreatorPerformancePeriod {
  Last30Days = 'LAST_30_DAYS',
  Last90Days = 'LAST_90_DAYS',
}

/**
 * Whether a value belongs to the selected window or is a running total.
 *
 * Only impressions have a daily breakdown behind them, so outbound visits come
 * back as `Lifetime`. A label that says "last 30 days" over a lifetime number
 * would be wrong, so read this before writing the caption.
 */
export enum CreatorMetricSemantics {
  Period = 'PERIOD',
  Lifetime = 'LIFETIME',
}

export enum CreatorPostSortBy {
  PublishedAt = 'PUBLISHED_AT',
  Impressions = 'IMPRESSIONS',
  Upvotes = 'UPVOTES',
  Comments = 'COMMENTS',
  OutboundVisits = 'OUTBOUND_VISITS',
}

export enum CreatorPostSortOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export interface CreatorMetric {
  /**
   * `null` means the number is unknown, which is not the same as `0`. Render
   * an em dash or an explanation, never a zero.
   */
  value: number | null;
  /** Equivalent prior window, or `null` when a comparison would mislead. */
  previous: number | null;
  semantics: CreatorMetricSemantics;
}

export interface CreatorPerformanceCoverage {
  /** `YYYY-MM-DD`, UTC. */
  requestedStartDate: string;
  /** `YYYY-MM-DD`, UTC. Always yesterday — today is still being written. */
  endDate: string;
  /** First day the numbers genuinely cover, `null` when none of them do. */
  coveredStartDate: string | null;
  firstAvailableDate: string | null;
  lastAvailableDate: string | null;
  requestedDays: number;
  coveredDays: number;
  isComplete: boolean;
  isPreviousPeriodComplete: boolean;
}

export interface CreatorPerformance {
  period: CreatorPerformancePeriod;
  coverage: CreatorPerformanceCoverage;
  updatedAt: string | null;
  impressions: CreatorMetric;
  outboundVisits: CreatorMetric;
  upvotes: CreatorMetric;
  comments: CreatorMetric;
}

export interface CreatorPostPerformance {
  id: string;
  post: {
    id: string;
    title: string | null;
    image: string | null;
    createdAt: string;
    commentsPermalink: string;
  };
  /** `null` when daily history does not reach this post — unknown, not zero. */
  impressions: number | null;
  upvotes: number;
  comments: number;
  outboundVisits: number;
}

const CREATOR_METRIC_FRAGMENT = gql`
  fragment CreatorMetricFragment on CreatorMetric {
    value
    previous
    semantics
  }
`;

export const CREATOR_PERFORMANCE_QUERY = gql`
  query CreatorPerformance($period: CreatorPerformancePeriod) {
    creatorPerformance(period: $period) {
      period
      coverage {
        requestedStartDate
        endDate
        coveredStartDate
        firstAvailableDate
        lastAvailableDate
        requestedDays
        coveredDays
        isComplete
        isPreviousPeriodComplete
      }
      updatedAt
      impressions {
        ...CreatorMetricFragment
      }
      outboundVisits {
        ...CreatorMetricFragment
      }
      upvotes {
        ...CreatorMetricFragment
      }
      comments {
        ...CreatorMetricFragment
      }
    }
  }
  ${CREATOR_METRIC_FRAGMENT}
`;

export const CREATOR_POST_PERFORMANCE_QUERY = gql`
  query CreatorPostPerformance(
    $after: String
    $first: Int
    $period: CreatorPerformancePeriod
    $sortBy: CreatorPostSortBy
    $order: CreatorPostSortOrder
  ) {
    creatorPostPerformance(
      after: $after
      first: $first
      period: $period
      sortBy: $sortBy
      order: $order
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          impressions
          upvotes
          comments
          outboundVisits
          post {
            id
            title
            image
            createdAt
            commentsPermalink
          }
        }
      }
    }
  }
`;

export const creatorPostPerformancePageSize = 20;

/**
 * Overview numbers for one creator's own posts.
 *
 * The shape is deliberately not flattened: `coverage` says how much of the
 * window the numbers actually reach, and every metric carries its own
 * `semantics` and `previous`. Rendering the bare integers would put a lifetime
 * total under a 30-day heading, or a zero where the answer is "unknown".
 */
export const creatorPerformanceQueryOptions = ({
  user,
  period = CreatorPerformancePeriod.Last30Days,
}: {
  user: Pick<LoggedUser, 'id'> | null | undefined;
  period?: CreatorPerformancePeriod;
}) => ({
  queryKey: generateQueryKey(
    RequestKey.CreatorPerformance,
    user ?? undefined,
    period,
  ),
  queryFn: async () => {
    const { creatorPerformance } = await gqlClient.request<{
      creatorPerformance: CreatorPerformance;
    }>(CREATOR_PERFORMANCE_QUERY, { period });

    return creatorPerformance;
  },
  enabled: !!user,
  staleTime: StaleTime.Default,
});

/** Spread into `useInfiniteQuery`; the server caps `first` at 50. */
export const creatorPostPerformanceQueryOptions = ({
  user,
  period = CreatorPerformancePeriod.Last30Days,
  sortBy = CreatorPostSortBy.PublishedAt,
  order = CreatorPostSortOrder.Desc,
  first = creatorPostPerformancePageSize,
}: {
  user: Pick<LoggedUser, 'id'> | null | undefined;
  period?: CreatorPerformancePeriod;
  sortBy?: CreatorPostSortBy;
  order?: CreatorPostSortOrder;
  first?: number;
}) => ({
  // Sort and period are part of the key: the server re-ranks and re-scopes the
  // rows, so pages fetched under one setting cannot be reused under another.
  queryKey: generateQueryKey(
    RequestKey.CreatorPostPerformance,
    user ?? undefined,
    {
      period,
      sortBy,
      order,
      first,
    },
  ),
  queryFn: async ({ pageParam }: { pageParam?: string }) => {
    const { creatorPostPerformance } = await gqlClient.request<{
      creatorPostPerformance: Connection<CreatorPostPerformance>;
    }>(CREATOR_POST_PERFORMANCE_QUERY, {
      after: pageParam,
      first,
      period,
      sortBy,
      order,
    });

    return creatorPostPerformance;
  },
  initialPageParam: '',
  getNextPageParam: (lastPage: Connection<CreatorPostPerformance>) =>
    getNextPageParam(lastPage?.pageInfo),
  enabled: !!user,
  staleTime: StaleTime.Default,
});
