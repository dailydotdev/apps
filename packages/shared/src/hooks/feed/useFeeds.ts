import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { FeedList, Feed } from '../../graphql/feed';
import {
  FEED_LIST_QUERY,
  CREATE_FEED_MUTATION,
  UPDATE_FEED_MUTATION,
  DELETE_FEED_MUTATION,
} from '../../graphql/feed';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { labels } from '../../lib';
import { useToastNotification } from '../useToastNotification';
import { gqlClient } from '../../graphql/common';
import { useConditionalFeature } from '../useConditionalFeature';
import { featureFeedTagChips } from '../../lib/featureManagement';

export type CreateFeedProps = {
  name: string;
  icon?: string;
};

export type UpdateFeedProps = { feedId: string } & CreateFeedProps;

export type DeleteFeedProps = Pick<UpdateFeedProps, 'feedId'>;

export type UseFeeds = {
  feeds: FeedList['feedList'] | undefined;
  createFeed: (props: CreateFeedProps) => Promise<Feed>;
  updateFeed: (props: UpdateFeedProps) => Promise<Feed>;
  deleteFeed: (props: DeleteFeedProps) => Promise<Pick<Feed, 'id'>>;
};

export const useFeeds = (): UseFeeds => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user, feeds: bootFeeds } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.Feeds, user);

  const { value: includeTagChipFeeds } = useConditionalFeature({
    feature: featureFeedTagChips,
    shouldEvaluate: !!user,
  });

  const initialData: FeedList['feedList'] | undefined = useMemo(() => {
    if (!bootFeeds) {
      return undefined;
    }

    return {
      edges: bootFeeds.map((node) => ({ node })),
      pageInfo: { hasNextPage: false },
    };
  }, [bootFeeds]);

  const { data: feeds } = useQuery({
    queryKey,

    queryFn: async () => {
      const result = await gqlClient.request<FeedList>(FEED_LIST_QUERY, {
        includeTagChipFeeds,
      });

      return result.feedList;
    },
    enabled: !!user,
    initialData,
    initialDataUpdatedAt: 0, // to interim force re-fetch until we sunset boot feeds data
    staleTime: StaleTime.OneHour,
  });

  const { mutateAsync: createFeed } = useMutation({
    mutationFn: async (createProps: CreateFeedProps) => {
      const result = await gqlClient.request<{ createFeed: Feed }>(
        CREATE_FEED_MUTATION,
        createProps,
      );

      return result.createFeed;
    },

    onSuccess: (data) => {
      queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
        return {
          pageInfo: { hasNextPage: false },
          ...current,
          edges: [
            ...(current?.edges || []),
            {
              node: data,
            },
          ],
        };
      });
    },

    onError: () => {
      displayToast(labels.error.generic);
    },
  });

  const { mutateAsync: updateFeed } = useMutation({
    mutationFn: async (updateProps: UpdateFeedProps) => {
      const result = await gqlClient.request<{ updateFeed: Feed }>(
        UPDATE_FEED_MUTATION,
        updateProps,
      );

      return result.updateFeed;
    },

    onSuccess: (data) => {
      queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
        return {
          pageInfo: { hasNextPage: false },
          ...current,
          edges: (current?.edges || []).map((edge) => {
            if (edge.node.id === data.id) {
              return { node: data };
            }

            return edge;
          }),
        };
      });
    },

    onError: () => {
      displayToast(labels.error.generic);
    },
  });

  const { mutateAsync: deleteFeed } = useMutation({
    mutationFn: async ({
      feedId,
    }: DeleteFeedProps): Promise<Pick<Feed, 'id'>> => {
      await gqlClient.request(DELETE_FEED_MUTATION, {
        feedId,
      });

      return { id: feedId };
    },

    onSuccess: (data) => {
      queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
        return {
          pageInfo: { hasNextPage: false },
          ...current,
          edges: (current?.edges || []).filter(
            (edge) => edge.node.id !== data.id,
          ),
        };
      });
    },
  });

  return {
    feeds,
    createFeed,
    updateFeed,
    deleteFeed,
  };
};
