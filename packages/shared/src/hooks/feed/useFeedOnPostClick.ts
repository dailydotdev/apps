import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Post } from '../../graphql/posts';
import type { FeedItem } from '../useFeed';
import useOnPostClick from '../useOnPostClick';
import { updateFeedAndAdsCache } from '../../lib/query';

interface PostClickOptionalProps {
  skipPostUpdate?: boolean;
}

export type FeedPostClick = (
  post: Post,
  index: number,
  row: number,
  column: number,
  optional?: PostClickOptionalProps,
) => Promise<void>;

export default function useFeedOnPostClick(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
  feedName: string,
  ranking?: string,
  eventName = 'click',
  feedQueryKey?: unknown[],
): FeedPostClick {
  const queryClient = useQueryClient();
  const onPostClick = useOnPostClick({
    eventName,
    columns,
    feedName,
    ranking,
  });

  return useMemo(
    () =>
      async (post, index, row, column, optional): Promise<void> => {
        await onPostClick({ post, row, column, optional });

        if (optional?.skipPostUpdate) {
          return;
        }

        const item = items[index];
        if (item.type === 'post') {
          updatePost(item.page, item.index, { ...post, read: true });
        } else if (item.type === 'ad' && item.ad.data?.post && feedQueryKey) {
          updateFeedAndAdsCache(post.id, feedQueryKey, queryClient, {
            read: true,
          });
        }
      },
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, updatePost, columns, feedName, ranking],
  );
}
