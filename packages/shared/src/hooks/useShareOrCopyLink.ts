import { useContext } from 'react';
import AnalyticsContext from '../contexts/AnalyticsContext';

interface UseShareOrCopyLinkProps {
  link: string;
  text: string;
  copyLink?: () => Promise<void>;
  trackObject?: Record<string, unknown>;
}
export function useShareOrCopyLink({
  link,
  text,
  copyLink,
  trackObject,
}: UseShareOrCopyLinkProps): () => Promise<void> {
  const { trackEvent } = useContext(AnalyticsContext);

  const onShareOrCopy = async () => {
    trackEvent(trackObject);
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
      copyLink?.();
    }
  };

  return onShareOrCopy;
}
