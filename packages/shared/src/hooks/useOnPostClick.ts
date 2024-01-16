import { useContext, useMemo } from 'react';
import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useQueryClient,
} from '@tanstack/react-query';
import useIncrementReadingRank from './useIncrementReadingRank';
import AnalyticsContext from '../contexts/AnalyticsContext';
import {
  feedAnalyticsExtra,
  optimisticPostUpdateInFeed,
  postAnalyticsEvent,
} from '../lib/feed';
import { Post, PostType } from '../graphql/posts';
import { Origin } from '../lib/analytics';
import { ActiveFeedContext } from '../contexts';
import { updateCachedPagePost } from '../lib/query';
import { usePostFeedback } from './usePostFeedback';
import { FeedLayoutV1FeedPages, useFeedLayout } from './useFeedLayout';
import { SharedFeedPage } from '../components/utilities';
import { FeedData } from '../graphql/feed';

interface PostClickOptionalProps {
  skipPostUpdate?: boolean;
  parent_id?: string;
}

export type FeedPostClick = ({
  post,
  row,
  column,
  optional,
}: {
  post: Post;
  row?: number;
  column?: number;
  optional?: PostClickOptionalProps;
}) => Promise<void>;

const getFeedQueryKeys = (client: QueryClient): QueryKey[] => {
  const queryKeys = client
    .getQueryCache()
    .findAll()
    .map((query) => query.queryKey);

  // filter only query keys for supported feed layout v1 feeds
  const keys = queryKeys.filter(
    (key) =>
      Array.isArray(key) && key.length > 0 && FeedLayoutV1FeedPages.has(key[0]),
  );
  return keys;
};

interface PostItem {
  post: Post;
  page: number;
  index: number;
}

const findPost = (data: InfiniteData<FeedData>, id: string): PostItem => {
  let index = -1;
  const pageIndex = data.pages.findIndex(({ page }) => {
    index = page.edges.findIndex(({ node }) => node.id === id);
    return index > -1;
  });

  const post =
    pageIndex > -1 && index > -1
      ? data.pages[pageIndex].page.edges[index].node
      : undefined;

  return {
    post,
    page: pageIndex,
    index,
  };
};
interface UseOnPostClickProps {
  eventName?: string;
  columns?: number;
  feedName?: string;
  ranking?: string;
  origin?: Origin;
}

export default function useOnPostClick({
  eventName = 'go to link',
  columns,
  feedName,
  ranking,
  origin,
}: UseOnPostClickProps): FeedPostClick {
  const client = useQueryClient();
  const { trackEvent } = useContext(AnalyticsContext);
  const { incrementReadingRank } = useIncrementReadingRank();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const { shouldUseFeedLayoutV1 } = useFeedLayout({
    // need to provide something, otherwise it's always false
    feedName: SharedFeedPage.MyFeed,
  });

  const { isLowImpsEnabled } = usePostFeedback();

  return useMemo(
    () =>
      async ({ post, row, column, optional }): Promise<void> => {
        trackEvent(
          postAnalyticsEvent(eventName, post, {
            columns,
            column,
            row,
            extra: {
              ...feedAnalyticsExtra(
                feedName,
                ranking,
                null,
                origin,
                null,
                optional?.parent_id,
              ).extra,
              feedback: post.type === PostType.Article ? true : undefined,
              low_imps: isLowImpsEnabled ? true : undefined,
            },
          }),
        );

        if (optional?.skipPostUpdate) {
          return;
        }

        if (!post.read) {
          await incrementReadingRank();
        }

        if (eventName === 'go to link') {
          const mutationHandler = () => {
            return {
              read: true,
            };
          };

          if (feedQueryKey) {
            const updateFeedPost = updateCachedPagePost(feedQueryKey, client);
            const updateFeedPostCache = optimisticPostUpdateInFeed(
              items,
              updateFeedPost,
              mutationHandler,
            );
            const postIndex = items.findIndex(
              (item) => item.type === 'post' && item.post.id === post.id,
            );

            if (postIndex === -1) {
              return;
            }

            updateFeedPostCache({ index: postIndex });
          } else if (shouldUseFeedLayoutV1) {
            const trySetPostRead = (queryKey: QueryKey, id: string) => {
              const updateFeedPost = updateCachedPagePost(
                queryKey as unknown[],
                client,
              );

              const data = client.getQueryData(
                queryKey,
              ) as InfiniteData<FeedData>;

              const { post: foundPost, page, index } = findPost(data, post.id);
              if (foundPost) {
                updateFeedPost(page, index, {
                  ...foundPost,
                  ...mutationHandler(),
                });
              }
            };

            for (const key of getFeedQueryKeys(client)) {
              trySetPostRead(key, post.id);
            }
          }
        }
      },
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, feedName, ranking, origin],
  );
}
