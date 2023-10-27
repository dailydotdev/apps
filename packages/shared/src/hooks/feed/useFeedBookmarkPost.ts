import { useContext } from 'react';
import useBookmarkPost from '../useBookmarkPost';
import { FeedItem } from '../useFeed';
import {
  feedAnalyticsExtra,
  optimisticPostUpdateInFeed,
  postAnalyticsEvent,
} from '../../lib/feed';
import { Post } from '../../graphql/posts';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { AuthTriggers } from '../../lib/auth';
import { AnalyticsEvent } from '../../lib/analytics';

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
  targetBookmarkState: boolean,
) => Promise<void> {
  const { user, showLogin } = useContext(AuthContext);
  const { trackEvent } = useContext(AnalyticsContext);

  const { bookmark, bookmarkToast, removeBookmark } = useBookmarkPost<{
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

  return async (
    post,
    index,
    row,
    column,
    targetBookmarkState,
  ): Promise<void> => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Bookmark });
      return;
    }
    trackEvent(
      postAnalyticsEvent(
        targetBookmarkState
          ? AnalyticsEvent.BookmarkPost
          : AnalyticsEvent.RemovePostBookmark,
        post,
        {
          columns,
          column,
          row,
          ...feedAnalyticsExtra(feedName, ranking),
        },
      ),
    );
    if (targetBookmarkState) {
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
    bookmarkToast(targetBookmarkState);
  };
}
