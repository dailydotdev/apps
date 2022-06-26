import { useContext } from 'react';
import { Post } from '../../graphql/posts';
import { FeedItem, PostItem } from '../useFeed';
import useIncrementReadingRank from '../useIncrementReadingRank';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { feedAnalyticsExtra, postAnalyticsEvent } from '../../lib/feed';
import FeaturesContext from '../../contexts/FeaturesContext';

interface PostClickOptionalProps {
  shouldUpdateRead?: boolean;
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
  event = 'click',
): FeedPostClick {
  const { postModalByDefault } = useContext(FeaturesContext);
  const { incrementReadingRank } = useIncrementReadingRank();
  const { trackEvent } = useContext(AnalyticsContext);

  return async (
    post,
    index,
    row,
    column,
    { shouldUpdateRead = true } = {},
  ): Promise<void> => {
    trackEvent(
      postAnalyticsEvent(event, post, {
        columns,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking, { modal: postModalByDefault }),
      }),
    );

    if (shouldUpdateRead) {
      if (!post.read) {
        await incrementReadingRank();
      }
      const item = items[index] as PostItem;
      updatePost(item.page, item.index, { ...post, read: true });
    }
  };
}
