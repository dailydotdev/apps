import { useCallback } from 'react';
import type { Post } from '../graphql/posts';
import { usePostLogEvent } from '../lib/feed';
import { useLogContext } from '../contexts/LogContext';
import { ShareProvider } from '../lib/share';
import type { Origin } from '../lib/log';
import { useCopyPostLink } from './useCopyPostLink';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ReferralCampaignKey } from '../lib';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import type { ShareProps } from '../components/modals/post/common';
import { LogEvent } from '../lib/log';

type FuncProps = Omit<ShareProps, 'origin'>;

interface UseSharePost {
  openSharePost: (props: FuncProps) => void;
  copyLink: (props: FuncProps) => void;
  openNativeSharePost?: (post: Post) => void;
}

export function useSharePost(origin: Origin): UseSharePost {
  const { logEvent } = useLogContext();
  const [, copyLink] = useCopyPostLink();
  const { getShortUrl, getTrackedUrl } = useGetShortUrl();
  const { openModal } = useLazyModal();
  const postLogEvent = usePostLogEvent();

  const openSharePost = useCallback(
    (props) => openModal({ type: LazyModal.Share, props }),
    [openModal],
  );

  const copyLinkShare: UseSharePost['copyLink'] = useCallback(
    ({ post, columns, column, row }) => {
      logEvent(
        postLogEvent(LogEvent.SharePost, post, {
          columns,
          column,
          row,
          extra: { provider: ShareProvider.CopyLink, origin },
        }),
      );
      const trackedLink = getTrackedUrl(
        post.commentsPermalink,
        ReferralCampaignKey.SharePost,
      );
      copyLink({ link: trackedLink, shorten: true });
    },
    [logEvent, origin, getTrackedUrl, copyLink, postLogEvent],
  );

  const openNativeSharePost = useCallback(
    async (post: Post) => {
      try {
        const shortLink = await getShortUrl(
          post.commentsPermalink,
          ReferralCampaignKey.SharePost,
        );
        await navigator.share({
          title: post.title,
          url: shortLink,
        });
        logEvent(
          postLogEvent(LogEvent.SharePost, post, {
            extra: { origin, provider: ShareProvider.Native },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    },
    [getShortUrl, origin, logEvent, postLogEvent],
  );

  return {
    openSharePost,
    copyLink: copyLinkShare,
    openNativeSharePost,
  };
}
