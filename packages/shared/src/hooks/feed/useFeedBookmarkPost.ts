import { useContext } from 'react';
import useBookmarkPost from '../useBookmarkPost';
import { FeedItem } from '../useFeed';
import {
  postAnalyticsEvent,
  optimisticPostUpdateInFeed,
  feedAnalyticsExtra,
} from '../../lib/feed';
import { Post } from '../../graphql/posts';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { postEventName } from '../../components/utilities';

export default function useFeedBookmarkPost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
  feedName: string,
  ranking?: string,
): (
  post: Post,
  index: number,
  row: number,
  column: number,
  bookmarked: boolean,
) => Promise<void> {
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { bookmark, removeBookmark } = useBookmarkPost<{
    id: string;
    index: number;
  }>({
    onBookmarkMutate: optimisticPostUpdateInFeed(items, updatePost, () => ({
      bookmarked: true,
    })),
    onRemoveBookmarkMutate: optimisticPostUpdateInFeed(
      items,
      updatePost,
      () => ({ bookmarked: false }),
    ),
  });

  return async (post, index, row, column, bookmarked): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent(
      postAnalyticsEvent(postEventName({ bookmarked }), post, {
        columns,
        column,
        row,
        ...feedAnalyticsExtra(feedName, ranking),
      }),
    );
    if (bookmarked) {
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
  };
}
