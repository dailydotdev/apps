import { getShareableLink } from '../lib/share';
import { CopyNotifyFunction, useCopyLink } from './useCopyLink';

export function useCopyPostLink(): [boolean, CopyNotifyFunction] {
  const [copying, copy] = useCopyLink(getShareableLink);

  return [copying, copy];
}
