import { CopyNotifyFunction, useCopyLink } from './useCopy';

export function useCopyPostLink(link?: string): [boolean, CopyNotifyFunction] {
  const [copying, copy] = useCopyLink(link ? () => link : undefined);

  return [copying, copy];
}
