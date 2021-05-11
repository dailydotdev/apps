import { useState } from 'react';
import { getShareableLink } from '@dailydotdev/shared/src/lib/share';
import { trackEvent } from '@dailydotdev/shared/src/lib/analytics';

export function useCopyPostLink(): [boolean, () => Promise<void>] {
  const [copying, setCopying] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(getShareableLink());
    setCopying(true);
    trackEvent({
      category: 'Post',
      action: 'Share',
      label: 'Copy',
    });
    setTimeout(() => {
      setCopying(false);
    }, 1000);
  };

  return [copying, copy];
}
