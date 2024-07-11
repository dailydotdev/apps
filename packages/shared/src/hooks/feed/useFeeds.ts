import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FeedList,
  FEED_LIST_QUERY,
  CREATE_FEED_MUTATION,
  Feed,
  UPDATE_FEED_MUTATION,
  DELETE_FEED_MUTATION,
} from '../../graphql/feed';
import { generateQueryKey, RequestKey, StaleTime } from '../../lib/query';
import { useAuthContext } from '../../contexts/AuthContext';
import { labels } from '../../lib';
import { useToastNotification } from '../useToastNotification';
import { gqlClient } from '../../graphql/common';

export type CreateFeedProps = {
  name: string;
};

export type UpdateFeedProps = { feedId: string } & CreateFeedProps;

export type DeleteFeedProps = Pick<UpdateFeedProps, 'feedId'>;

export type UseFeeds = {
  feeds: FeedList['feedList'];
  createFeed: (props: CreateFeedProps) => Promise<Feed>;
  updateFeed: (props: UpdateFeedProps) => Promise<Feed>;
  deleteFeed: (props: DeleteFeedProps) => Promise<Pick<Feed, 'id'>>;
};

export const useFeeds = (): UseFeeds => {
  const queryClient = useQueryClient();
  const { displayToast } = useToastNotification();
  const { user } = useAuthContext();
  const queryKey = generateQueryKey(RequestKey.Feeds, user);

  const { data: feeds } = useQuery(
    queryKey,
    async () => {
      const result = await gqlClient.request<FeedList>(FEED_LIST_QUERY);

      return result.feedList;
    },
    {
      enabled: !!user,
      staleTime: StaleTime.OneHour,
    },
  );

  const { mutateAsync: createFeed } = useMutation(
    async ({ name }: CreateFeedProps) => {
      const result = await gqlClient.request<{ createFeed: Feed }>(
        CREATE_FEED_MUTATION,
        {
          name,
        },
      );

      return result.createFeed;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
          return {
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
    },
  );

  const { mutateAsync: updateFeed } = useMutation(
    async ({ feedId, name }: UpdateFeedProps) => {
      const result = await gqlClient.request<{ updateFeed: Feed }>(
        UPDATE_FEED_MUTATION,
        {
          feedId,
          name,
        },
      );

      return result.updateFeed;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
          return {
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
    },
  );

  const { mutateAsync: deleteFeed } = useMutation(
    async ({ feedId }: DeleteFeedProps): Promise<Pick<Feed, 'id'>> => {
      await gqlClient.request(DELETE_FEED_MUTATION, {
        feedId,
      });

      return { id: feedId };
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData<FeedList['feedList']>(queryKey, (current) => {
          return {
            ...current,
            edges: (current?.edges || []).filter(
              (edge) => edge.node.id !== data.id,
            ),
          };
        });
      },
    },
  );

  return {
    feeds,
    createFeed,
    updateFeed,
    deleteFeed,
  };
};
