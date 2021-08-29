import { useContext } from 'react';
import useBookmarkPost from '../useBookmarkPost';
import { FeedItem } from '../useFeed';
import { postAnalyticsEvent, optimisticPostUpdateInFeed } from '../../lib/feed';
import { Post } from '../../graphql/posts';
import OnboardingContext, {
  EngagementAction,
} from '../../contexts/OnboardingContext';
import AuthContext from '../../contexts/AuthContext';
import AnalyticsContext from '../../contexts/AnalyticsContext';

export default function useFeedBookmarkPost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
  columns: number,
): (
  post: Post,
  index: number,
  row: number,
  column: number,
  bookmarked: boolean,
) => Promise<void> {
  const { trackEngagement } = useContext(OnboardingContext);
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
      postAnalyticsEvent(
        bookmarked ? 'bookmark post' : 'remove post bookmark',
        post,
        {
          columns,
          column,
          row,
          extra: { origin: 'feed' },
        },
      ),
    );
    if (bookmarked) {
      await trackEngagement(EngagementAction.Bookmark);
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
  };
}
