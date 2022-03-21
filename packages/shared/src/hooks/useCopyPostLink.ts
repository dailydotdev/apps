import { getShareableLink } from '../lib/share';
import { useCopyLink } from './useCopyLink';

export function useCopyPostLink(): [boolean, () => Promise<void>] {
  const [copying, copy] = useCopyLink(getShareableLink);

  return [copying, copy];
}
