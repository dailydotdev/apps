import { gql } from 'graphql-request';
import type { LoggedUser } from '../lib/user';
import { generateQueryKey, RequestKey, StaleTime } from '../lib/query';
import type { ApiErrorResult } from './common';
import { ApiError, getApiError, gqlClient } from './common';
import { gqlBatchRequest } from './batch';

/**
 * What a feed widget keeps for the reader beyond its place on the rail, one
 * row per key: the widget kind, optionally followed by the widget instance id
 * (`todoList`, `squadUpdates:<widget id>`) for a kind that may sit on the rail
 * more than once.
 */
export type FeedWidgetData<T = Record<string, unknown>> = {
  key: string;
  data: T;
  /** Bumped by every write; send it back to only overwrite what was read. */
  revision: number;
  updatedAt: string;
};

export const FEED_WIDGET_DATA_QUERY = gql`
  query FeedWidgetData($key: String!) {
    feedWidgetData(key: $key) {
      key
      data
      revision
      updatedAt
    }
  }
`;

export const UPDATE_FEED_WIDGET_DATA_MUTATION = gql`
  mutation UpdateFeedWidgetData($key: String!, $data: JSON!, $revision: Int) {
    updateFeedWidgetData(key: $key, data: $data, revision: $revision) {
      key
      data
      revision
      updatedAt
    }
  }
`;

export const feedWidgetDataQueryOptions = <T = Record<string, unknown>>({
  key,
  user,
}: {
  key: string;
  user?: Pick<LoggedUser, 'id'>;
}) => ({
  queryKey: generateQueryKey(RequestKey.FeedWidgetData, user, key),
  queryFn: async (): Promise<FeedWidgetData<T> | null> => {
    const res = await gqlBatchRequest<{
      feedWidgetData: FeedWidgetData<T> | null;
    }>(FEED_WIDGET_DATA_QUERY, { key });

    return res.feedWidgetData;
  },
  enabled: !!user,
  staleTime: StaleTime.Default,
});

/**
 * Replaces the row. With `revision` the write lands only on that revision (0
 * when nothing was saved yet) and fails with a conflict otherwise, so a tab
 * holding an older copy cannot erase what another tab saved.
 */
export const updateFeedWidgetData = async <T = Record<string, unknown>>({
  key,
  data,
  revision,
}: {
  key: string;
  data: T;
  revision?: number;
}): Promise<FeedWidgetData<T>> => {
  const res = await gqlClient.request<{
    updateFeedWidgetData: FeedWidgetData<T>;
  }>(UPDATE_FEED_WIDGET_DATA_MUTATION, { key, data, revision });

  return res.updateFeedWidgetData;
};

export const isFeedWidgetDataConflict = (error: unknown): boolean =>
  !!getApiError(error as ApiErrorResult, ApiError.Conflict);
