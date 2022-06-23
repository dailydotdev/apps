import { useContext, useState } from 'react';
import { Post } from '../graphql/posts';
import { postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';

export function useSharePost(origin: string): {
  sharePost: { post?: Post };
  openSharePost: (post?: Post) => void;
  closeSharePost: () => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<{
    post?: Post;
  }>();

  const openSharePost = async (post: Post) => {
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { origin },
      }),
    );
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: post.title,
          url: post.commentsPermalink,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      setShareModal({ post });
    }
  };

  const closeSharePost = () => {
    setShareModal(null);
  };

  return { sharePost: shareModal, openSharePost, closeSharePost };
}
