import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { SlackChannel } from '../../../graphql/integrations';
import { SLACK_CHANNELS_QUERY } from '../../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';

type SlackChannelsResponse = {
  slackChannels: {
    data: SlackChannel[];
    cursor?: string;
  };
};

export type UseSlackChannelsQueryProps = {
  integrationId: string;
  queryOptions?: { enabled?: boolean };
  selectedChannelId?: string;
  /**
   * Pull the remaining pages in the background. Slack has no channel search
   * endpoint, so filtering can only ever happen over what has been fetched, and
   * a search box that quietly ignores unfetched channels is worse than none.
   */
  fetchAll?: boolean;
};

export type UseSlackChannelsQuery = {
  channels: SlackChannel[];
  isFetchingAll: boolean;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
};

// a bound so a very large workspace cannot turn the picker into a request storm
// against Slack's per-minute limit; the filter then covers the first pages only
const maxAutoFetchedPages = 10;

export const useSlackChannelsQuery = ({
  integrationId,
  queryOptions,
  selectedChannelId,
  fetchAll = false,
}: UseSlackChannelsQueryProps): UseSlackChannelsQuery => {
  const { user } = useAuthContext();
  const enabled = !!integrationId;

  const queryResult = useInfiniteQuery({
    queryKey: generateQueryKey(RequestKey.SlackChannels, user, {
      integrationId,
    }),
    queryFn: async ({ pageParam }) => {
      const result = await gqlClient.request<SlackChannelsResponse>(
        SLACK_CHANNELS_QUERY,
        {
          integrationId,
          cursor: pageParam || undefined,
        },
      );

      return result;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.slackChannels?.cursor || null,
    staleTime: StaleTime.Default,
    enabled:
      typeof queryOptions?.enabled !== 'undefined'
        ? queryOptions.enabled && enabled
        : enabled,
  });

  // Flatten all fetched pages into a single channel list.
  // When a channel was previously selected but hasn't been loaded yet
  // (it may be on a later page), prepend a placeholder entry so the
  // dropdown can display the selection immediately. Once the real
  // channel arrives via scroll pagination, it replaces the placeholder
  // because `found` becomes true and we return `fetched` as-is.
  const channels = useMemo(() => {
    const fetched = (queryResult.data?.pages ?? []).flatMap(
      (page) => page.slackChannels.data,
    );

    if (!selectedChannelId) {
      return fetched;
    }

    const found = fetched.some((ch) => ch.id === selectedChannelId);

    if (found) {
      return fetched;
    }

    return [
      { id: selectedChannelId, name: `Channel ${selectedChannelId}` },
      ...fetched,
    ];
  }, [queryResult.data?.pages, selectedChannelId]);

  const loadedPages = queryResult.data?.pages?.length ?? 0;
  const canFetchMore =
    fetchAll &&
    queryResult.hasNextPage &&
    !queryResult.isFetchingNextPage &&
    loadedPages < maxAutoFetchedPages;

  useEffect(() => {
    if (!canFetchMore) {
      return;
    }

    queryResult.fetchNextPage();
  }, [canFetchMore, queryResult]);

  return {
    channels,
    isFetchingAll: queryResult.isLoading || canFetchMore,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.isLoading,
  };
};
