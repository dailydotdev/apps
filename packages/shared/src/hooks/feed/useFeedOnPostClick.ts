import { useMemo } from 'react';
import { Post } from '../../graphql/posts';
import { FeedItem, PostItem } from '../useFeed';
import useOnPostClick from '../useOnPostClick';

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
): FeedPostClick {
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

        const item = items[index] as PostItem;
        updatePost(item.page, item.index, { ...post, read: true });
      },
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, updatePost, columns, feedName, ranking],
  );
}
