import { useMemo } from 'react';
import { Origin } from '../lib/analytics';
import { useAuthContext } from '../contexts/AuthContext';
import { useSharePost } from './useSharePost';
import { Post } from '../graphql/posts';
import useUpdatePost from './useUpdatePost';
import useBookmarkPost from './useBookmarkPost';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AuthTriggers } from '../lib/auth';
import { postAnalyticsEvent } from '../lib/feed';
import { postEventName } from '../components/utilities';
import useOnPostClick from './useOnPostClick';

interface UsePostContent {
  sharePost: Post;
  onShare: () => void;
  onCloseShare: () => void;
  onReadArticle: () => Promise<void>;
  onToggleBookmark: () => Promise<void>;
}

interface UsePostContentProps {
  origin: Origin;
  post: Post;
}

const usePostContent = ({
  origin,
  post,
}: UsePostContentProps): UsePostContent => {
  const id = post?.id;
  const { user, showLogin } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const { updatePost } = useUpdatePost();
  const onPostClick = useOnPostClick({ origin });
  const onReadArticle = () => onPostClick({ post });
  const { bookmark, bookmarkToast, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updatePost({ id, update: { bookmarked: true } }),
    onRemoveBookmarkMutate: updatePost({ id, update: { bookmarked: false } }),
  });
  const { sharePost, openSharePost, closeSharePost } = useSharePost(origin);
  const onShare = () => openSharePost(post);
  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin(AuthTriggers.Bookmark);
      return;
    }
    const targetBookmarkState = !post?.bookmarked;
    trackEvent(
      postAnalyticsEvent(
        postEventName({ bookmarked: targetBookmarkState }),
        post,
        { extra: { origin } },
      ),
    );
    if (targetBookmarkState) {
      await bookmark({ id: post?.id });
    } else {
      await removeBookmark({ id: post?.id });
    }
    bookmarkToast(targetBookmarkState);
  };

  return useMemo(
    () => ({
      sharePost,
      onReadArticle,
      onToggleBookmark: toggleBookmark,
      onShare,
      onCloseShare: closeSharePost,
    }),
    [post, origin],
  );
};

export default usePostContent;
