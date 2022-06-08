import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';
import { CopyNotifyFunction, useCopyLink } from './useCopyLink';

interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  trackObject?: () => Record<string, unknown>;
}
export function useShareOrCopyLink({
  link,
  text,
  trackObject,
}: UseShareOrCopyLinkProps): ReturnType<typeof useCopyLink> {
  const { trackEvent } = useContext(AnalyticsContext);
  const [copying, copyLink] = useCopyLink(() => link);

  const onShareOrCopy: CopyNotifyFunction = async (...args) => {
    trackEvent(trackObject());
    if ('share' in navigator) {
      try {
        await navigator.share({
          text,
          url: link,
        });
      } catch (err) {
        // Do nothing
      }
    } else {
      copyLink(...args);
    }
  };

  return [copying, onShareOrCopy];
}
