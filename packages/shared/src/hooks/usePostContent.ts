import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import { useSharePost } from './useSharePost';
import {
  Post,
  PostsEngaged,
  POSTS_ENGAGED_SUBSCRIPTION,
} from '../graphql/posts';
import { useAnalyticsContext } from '../contexts/AnalyticsContext';
import { postAnalyticsEvent } from '../lib/feed';
import useOnPostClick from './useOnPostClick';
import useSubscription from './useSubscription';
import { PostOrigin } from './analytics/useAnalyticsContextData';
import { updatePostCache } from './usePostById';

export interface UsePostContent {
  sharePost: Post;
  onSharePost: () => void;
  onCloseShare: () => void;
  onReadArticle: () => Promise<void>;
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
  const { user } = useAuthContext();
  const { trackEvent } = useAnalyticsContext();
  const onPostClick = useOnPostClick({ origin });
  const onReadArticle = () =>
    onPostClick({
      post: post?.sharedPost || post,
      optional: { parent_id: post.sharedPost && post.id },
    });
  const { sharePost, closeSharePost, copyLink } = useSharePost(origin);
  const onShare = () => copyLink(post);
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
      onSharePost: onShare,
      onCloseShare: closeSharePost,
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [post, user, origin, sharePost],
  );
};

export default usePostContent;
