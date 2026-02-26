import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { SlackChannel } from '../../../graphql/integrations';
import { SLACK_CHANNELS_QUERY } from '../../../graphql/integrations';
import { generateQueryKey, RequestKey, StaleTime } from '../../../lib/query';
import { gqlClient } from '../../../graphql/common';
import { useAuthContext } from '../../../contexts/AuthContext';
import { sortAlphabeticallyByProperty } from '../../../lib/func';

type SlackChannelsResponse = {
  slackChannels: {
    data: SlackChannel[];
    cursor?: string;
  };
};

export type UseSlackChannelsQueryProps = {
  integrationId: string;
  queryOptions?: { enabled?: boolean };
};

export type UseSlackChannelsQuery = {
  channels: SlackChannel[];
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
};

export const useSlackChannelsQuery = ({
  integrationId,
  queryOptions,
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

  const channels = useMemo(
    () =>
      (queryResult.data?.pages ?? [])
        .flatMap((page) => page.slackChannels.data)
        .sort(sortAlphabeticallyByProperty('name')),
    [queryResult.data?.pages],
  );

  return {
    channels,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.isLoading,
  };
};
