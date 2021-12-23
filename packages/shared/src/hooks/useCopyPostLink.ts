import { getShareableLink } from '../lib/share';
import { gaTrackEvent } from '../lib/analytics';
import { useCopyLink } from './useCopyLink';

export function useCopyPostLink(): [boolean, () => Promise<void>] {
  const [copying, copy] = useCopyLink(getShareableLink);

  return [
    copying,
    () => {
      gaTrackEvent({
        category: 'Post',
        action: 'Share',
        label: 'Copy',
      });
      return copy();
    },
  ];
}
