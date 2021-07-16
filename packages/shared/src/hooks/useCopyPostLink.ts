import { getShareableLink } from '../lib/share';
import { trackEvent } from '../lib/analytics';
import { useCopyLink } from './useCopyLink';

export function useCopyPostLink(): [boolean, () => Promise<void>] {
  const [copying, copy] = useCopyLink(getShareableLink);

  return [
    copying,
    () => {
      trackEvent({
        category: 'Post',
        action: 'Share',
        label: 'Copy',
      });
      return copy();
    },
  ];
}
