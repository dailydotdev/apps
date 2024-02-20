import { useContext, useMemo, useState } from 'react';
import { Post } from '../graphql/posts';
import { FeedItemPosition, postAnalyticsEvent } from '../lib/feed';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/analytics';
import { useCopyPostLink } from './useCopyPostLink';

export function useSharePost(origin: Origin): {
  sharePost: Post;
  sharePostFeedLocation?: FeedItemPosition;
  openSharePost: (Post, columns?, column?, row?) => void;
  copyLink: (Post, columns?, column?, row?) => void;
  closeSharePost: () => void;
  openNativeSharePost?: (Post, columns?, column?, row?) => void;
} {
  const { trackEvent } = useContext(AnalyticsContext);
  const [shareModal, setShareModal] = useState<Post>();
  const [, copyLink] = useCopyPostLink();
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
        setShareModal(post);
      },
      copyLink: async (
        post: Post,
        columns?: number,
        column?: number,
        row?: number,
      ) => {
        trackEvent(
          postAnalyticsEvent('share post', post, {
            columns,
            column,
            row,
            extra: { provider: ShareProvider.CopyLink, origin },
          }),
        );
        copyLink({ link: post.commentsPermalink });
      },
      openNativeSharePost: async (
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
        try {
          await navigator.share({
            title: post.title,
            url: post.commentsPermalink,
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
      },
      closeSharePost: () => setShareModal(null),
    }),
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shareModal, sharePostFeedLocation],
  );
}
