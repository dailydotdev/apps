import { useCallback, useContext } from 'react';
import { Post } from '../graphql/posts';
import { postLogEvent } from '../lib/feed';
import LogContext from '../contexts/LogContext';
import { ShareProvider } from '../lib/share';
import { Origin } from '../lib/log';
import { useCopyPostLink } from './useCopyPostLink';
import { useGetShortUrl } from './utils/useGetShortUrl';
import { ReferralCampaignKey } from '../lib';
import { useLazyModal } from './useLazyModal';
import { LazyModal } from '../components/modals/common/types';
import { ShareProps } from '../components/modals/post/common';

type FuncProps = Omit<ShareProps, 'origin'>;

interface UseSharePost {
  openSharePost: (props: FuncProps) => void;
  copyLink: (props: FuncProps) => void;
  openNativeSharePost?: (post: Post) => void;
}

export function useSharePost(origin: Origin): UseSharePost {
  const { logEvent } = useContext(LogContext);
  const [, copyLink] = useCopyPostLink();
  const { getShortUrl, getTrackedUrl } = useGetShortUrl();
  const { openModal } = useLazyModal();

  const openSharePost = useCallback(
    (props) => openModal({ type: LazyModal.Share, props }),
    [openModal],
  );

  const copyLinkShare: UseSharePost['copyLink'] = useCallback(
    ({ post, columns, column, row }) => {
      logEvent(
        postLogEvent('share post', post, {
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
    [logEvent, origin, getTrackedUrl, copyLink],
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
          postLogEvent('share post', post, {
            extra: { origin, provider: ShareProvider.Native },
          }),
        );
      } catch (err) {
        // Do nothing
      }
    },
    [getShortUrl, origin, logEvent],
  );

  return {
    openSharePost,
    copyLink: copyLinkShare,
    openNativeSharePost,
  };
}
