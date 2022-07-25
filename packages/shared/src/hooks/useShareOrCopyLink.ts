import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { CopyNotifyFunction, useCopyLink } from './useCopyLink';
import { ShareProvider } from '../lib/share';

interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  trackObject?: (provider: ShareProvider) => Record<string, unknown>;
}
export function useShareOrCopyLink({
  link,
  text,
  trackObject,
}: UseShareOrCopyLinkProps): ReturnType<typeof useCopyLink> {
  const { trackEvent } = useContext(AnalyticsContext);
  const [copying, copyLink] = useCopyLink(() => link);

  const onShareOrCopy: CopyNotifyFunction = async (...args) => {
    if ('share' in navigator) {
      try {
        await navigator.share({
          text: `${text}\n${link}`,
        });
        trackEvent(trackObject(ShareProvider.Native));
      } catch (err) {
        // Do nothing
      }
    } else {
      trackEvent(trackObject(ShareProvider.CopyLink));
      copyLink(...args);
    }
  };

  return [copying, onShareOrCopy];
}
