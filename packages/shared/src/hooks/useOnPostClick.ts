import { useContext, useMemo } from 'react';
import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import LogContext from '../contexts/LogContext';
import {
  feedLogExtra,
  optimisticPostUpdateInFeed,
  usePostLogEvent,
} from '../lib/feed';
import type { Post } from '../graphql/posts';
import { PostType } from '../graphql/posts';
import type { Origin } from '../lib/log';
import { ActiveFeedContext } from '../contexts';
import { updateCachedPagePost, updateFeedAndAdsCache } from '../lib/query';
import { FeedLayoutMobileFeedPages, useFeedLayout } from './useFeedLayout';
import type { FeedData } from '../graphql/feed';
import { useReadingStreak } from './streaks';
import { isBoostedPostAd } from './useFeed';

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
  return client
    .getQueryCache()
    .findAll()
    .reduce((queryKeys, query) => {
      const key = query.queryKey;
      // filter only query keys for supported feed layout list feeds
      if (
        Array.isArray(key) &&
        key.length > 0 &&
        FeedLayoutMobileFeedPages.has(key[0])
      ) {
        queryKeys.push(key);
      }
      return queryKeys;
    }, []);
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
  const { logEvent } = useContext(LogContext);
  const { checkReadingStreak } = useReadingStreak();
  const { queryKey: feedQueryKey, items } = useContext(ActiveFeedContext);
  const { shouldUseListFeedLayout } = useFeedLayout({
    feedRelated: false,
  });
  const postLogEvent = usePostLogEvent();

  return useMemo(
    () =>
      async ({ post, row, column, optional }): Promise<void> => {
        logEvent(
          postLogEvent(eventName, post, {
            columns,
            column,
            row,
            extra: {
              ...feedLogExtra(
                feedName,
                ranking,
                null,
                origin,
                null,
                optional?.parent_id,
              ).extra,
              feedback: post.type === PostType.Article ? true : undefined,
            },
          }),
        );

        if (optional?.skipPostUpdate) {
          return;
        }

        if (!post.read) {
          checkReadingStreak();
        }

        if (eventName === 'go to link') {
          const mutationHandler = () => {
            return {
              read: true,
            };
          };

          if (feedQueryKey) {
            const postIndex = items.findIndex(
              (item) =>
                (item.type === 'post' && item.post.id === post.id) ||
                (item.type === 'ad' && item.ad.data?.post?.id === post.id),
            );

            if (postIndex === -1) {
              return;
            }

            const item = items[postIndex];
            if (item.type === 'post') {
              // For regular posts, use the existing optimistic update
              const updateFeedPost = updateCachedPagePost(feedQueryKey, client);
              const updateFeedPostCache = optimisticPostUpdateInFeed(
                items,
                updateFeedPost,
                mutationHandler,
              );
              await updateFeedPostCache({ index: postIndex });
            } else if (isBoostedPostAd(item)) {
              // For Post Ads, update both feed and ads cache
              updateFeedAndAdsCache(
                post.id,
                feedQueryKey,
                client,
                mutationHandler(),
              );
            }
          } else if (!feedName && shouldUseListFeedLayout) {
            const trySetPostRead = (queryKey: QueryKey, id: string) => {
              const updateFeedPost = updateCachedPagePost(
                queryKey as unknown[],
                client,
              );

              const data = client.getQueryData(
                queryKey,
              ) as InfiniteData<FeedData>;

              const { post: foundPost, page, index } = findPost(data, id);
              if (foundPost) {
                updateFeedPost(page, index, {
                  ...foundPost,
                  ...mutationHandler(),
                });
              }
            };

            getFeedQueryKeys(client).forEach((key) => {
              trySetPostRead(key, post.id);
            });
          }
        }
      },
    [
      client,
      columns,
      eventName,
      feedName,
      feedQueryKey,
      checkReadingStreak,
      shouldUseListFeedLayout,
      items,
      ranking,
      origin,
      logEvent,
      postLogEvent,
    ],
  );
}
