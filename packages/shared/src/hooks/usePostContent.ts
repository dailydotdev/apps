import { useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { useSharePost } from './useSharePost';
import {
  Post,
  PostsEngaged,
  POSTS_ENGAGED_SUBSCRIPTION,
} from '../graphql/posts';
import useUpdatePost from './useUpdatePost';
import useBookmarkPost from './useBookmarkPost';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { AuthTriggers } from '../lib/auth';
import { postAnalyticsEvent } from '../lib/feed';
import useOnPostClick from './useOnPostClick';
import useSubscription from './useSubscription';
import { PostOrigin } from './analytics/useAnalyticsContextData';
import { updatePostCache } from './usePostById';
import { AnalyticsEvent } from '../lib/analytics';

export interface UsePostContent {
  sharePost: Post;
  onSharePost: () => void;
  onCloseShare: () => void;
  onReadArticle: () => Promise<void>;
  onToggleBookmark: () => Promise<void>;
}

export interface UsePostContentProps {
  origin: PostOrigin;
  post: Post;
}

const usePostContent = ({
  origin,
  post,
}: UsePostContentProps): UsePostContent => {
  const id = post?.id;
  const queryClient = useQueryClient();
  const { user, showLogin } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const { updatePost } = useUpdatePost();
  const onPostClick = useOnPostClick({ origin });
  const onReadArticle = () =>
    onPostClick({
      post: post?.sharedPost || post,
      optional: { parent_id: post.sharedPost && post.id },
    });
  const { bookmark, bookmarkToast, removeBookmark } = useBookmarkPost({
    onBookmarkMutate: updatePost({ id, update: { bookmarked: true } }),
    onRemoveBookmarkMutate: updatePost({ id, update: { bookmarked: false } }),
  });
  const { sharePost, openSharePost, closeSharePost } = useSharePost(origin);
  const onShare = () => openSharePost(post);
  const toggleBookmark = async (): Promise<void> => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.Bookmark });
      return;
    }
    const targetBookmarkState = !post?.bookmarked;
    trackEvent(
      postAnalyticsEvent(
        targetBookmarkState
          ? AnalyticsEvent.BookmarkPost
          : AnalyticsEvent.RemovePostBookmark,
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

  useSubscription(
    () => ({
      query: POSTS_ENGAGED_SUBSCRIPTION,
      variables: {
        ids: [id],
      },
    }),
    {
      next: (data: PostsEngaged) => {
        if (data.postsEngaged.id === id) {
          updatePostCache(queryClient, post.id, data.postsEngaged);
        }
      },
    },
  );

  useEffect(() => {
    if (!post) {
      return;
    }

    trackEvent(postAnalyticsEvent(`${origin} view`, post));
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  return useMemo(
    () => ({
      sharePost,
      onReadArticle,
      onToggleBookmark: toggleBookmark,
      onSharePost: onShare,
      onCloseShare: closeSharePost,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post, user, origin, sharePost],
  );
};

export default usePostContent;
