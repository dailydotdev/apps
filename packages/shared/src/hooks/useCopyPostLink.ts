import { CopyNotifyFunction, useCopyLink } from './useCopyLink';

export function useCopyPostLink(link: string): [boolean, CopyNotifyFunction] {
  const [copying, copy] = useCopyLink(() => link);

  return [copying, copy];
}
