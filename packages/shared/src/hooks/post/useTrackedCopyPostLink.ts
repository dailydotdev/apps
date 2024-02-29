import { useContext } from 'react';
import { Post } from '../../graphql/posts';
import { useCopyPostLink } from '../useCopyPostLink';
import AnalyticsContext from '../../contexts/AnalyticsContext';
import { ShareProvider } from '../../lib/share';
import { postAnalyticsEvent } from '../../lib/feed';
import { Origin } from '../../lib/analytics';

type UseTrackedCopyPostLink = (provider: ShareProvider) => void;

export const useTrackedCopyPostLink = (post: Post): UseTrackedCopyPostLink => {
  const [, copyLink] = useCopyPostLink(post.commentsPermalink);
  const { trackEvent } = useContext(AnalyticsContext);

  return (provider: ShareProvider) => {
    trackEvent(
      postAnalyticsEvent('share post', post, {
        extra: { provider, origin: Origin.ShareBar },
      }),
    );
    copyLink();
  };
};
