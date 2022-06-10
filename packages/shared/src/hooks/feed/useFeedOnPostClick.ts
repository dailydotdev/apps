import { useContext } from 'react';
import { Post } from '../../graphql/posts';
import { FeedItem, PostItem } from '../useFeed';
import useIncrementReadingRank from '../useIncrementReadingRank';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { feedAnalyticsExtra, postAnalyticsEvent } from '../../lib/feed';

export type FeedPostClick = (
  post: Post,
  index: number,
  row: number,
  column: number,
  e?: React.MouseEvent,
) => Promise<void>;

export default function useFeedOnPostClick(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
  feedName: string,
  ranking?: string,
): FeedPostClick {
  const { incrementReadingRank } = useIncrementReadingRank();
  const { trackEvent } = useContext(AnalyticsContext);

  return async (post, index, row, column): Promise<void> => {
    trackEvent(
      postAnalyticsEvent('click', post, {
        columns,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
    if (!post.read) {
      await incrementReadingRank();
    }
    const item = items[index] as PostItem;
    updatePost(item.page, item.index, { ...post, read: true });
  };
}
