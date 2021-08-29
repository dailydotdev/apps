import { useContext } from 'react';
import useBookmarkPost from '../useBookmarkPost';
import { FeedItem } from '../useFeed';
import { optimisticPostUpdateInFeed } from '../../lib/feed';
import { Post } from '../../graphql/posts';
import { trackEvent } from '../../lib/analytics';
import OnboardingContext, {
  EngagementAction,
} from '../../contexts/OnboardingContext';
import AuthContext from '../../contexts/AuthContext';

export default function useFeedBookmarkPost(
  items: FeedItem[],
  updatePost: (page: number, index: number, post: Post) => void,
): (post: Post, index: number, bookmarked: boolean) => Promise<void> {
  const { trackEngagement } = useContext(OnboardingContext);
  const { user, showLogin } = useContext(AuthContext);

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

  return async (
    post: Post,
    index: number,
    bookmarked: boolean,
  ): Promise<void> => {
    if (!user) {
      showLogin('bookmark');
      return;
    }
    trackEvent({
      category: 'Post',
      action: 'Bookmark',
      label: bookmarked ? 'Add' : 'Remove',
    });
    if (bookmarked) {
      await trackEngagement(EngagementAction.Bookmark);
      await bookmark({ id: post.id, index });
    } else {
      await removeBookmark({ id: post.id, index });
    }
  };
}
