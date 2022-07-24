import { useContext, useMemo, useState } from 'react';
import { Post } from '../graphql/posts';
import { FeedItemPosition, postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';

export function useSharePost(origin: Origin): {
  sharePost: Post;
  sharePostFeedLocation?: FeedItemPosition;
  openSharePost: (Post, columns?, column?, row?) => void;
  closeSharePost: () => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<Post>();
  const [sharePostFeedLocation, setSharePostFeedLocation] =
    useState<FeedItemPosition>({});

  return useMemo(
    () => ({
      sharePost: shareModal,
      sharePostFeedLocation,
      openSharePost: async (
        post: Post,
        columns?: number,
        column?: number,
        row?: number,
      ) => {
        setSharePostFeedLocation({
          columns,
          column,
          row,
        });
        if ('share' in navigator) {
          try {
            await navigator.share({
              text: `${post.title}\n${post.commentsPermalink}`,
            });
            trackEvent(
              postAnalyticsEvent('share post', post, {
                columns,
                column,
                row,
                extra: { origin, provider: ShareProvider.Native },
              }),
            );
          } catch (err) {
            // Do nothing
          }
        } else {
          setShareModal(post);
        }
      },
      closeSharePost: () => setShareModal(null),
    }),
    [shareModal, sharePostFeedLocation],
  );
}
