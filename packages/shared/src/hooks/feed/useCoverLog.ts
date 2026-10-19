import { useCallback } from 'react';
import type { Post } from '../../graphql/posts';
import type { CoverVariant } from '../../lib/cover';
import { coverLogExtra, resolveCoverPost } from '../../lib/cover';
import { useCoverSettings } from '../useCoverSettings';
import { useFeedLayout } from '../useFeedLayout';
import { useViewSize, ViewSize } from '../useViewSize';

export type CoverLogExtra = { cover?: CoverVariant };

// The cover label on impressions and clicks has to say what the card painted:
// a share card shows its shared post's image, and the list layout below
// laptop width hides placeholder covers altogether, so those get no label.
export const useCoverLog = (): ((
  post: Pick<Post, 'type' | 'sharedPost' | 'image' | 'hook'>,
) => CoverLogExtra) => {
  const coverSettings = useCoverSettings();
  const { shouldUseListFeedLayout } = useFeedLayout();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const coverHidden = shouldUseListFeedLayout && !isLaptop;

  return useCallback(
    (post) =>
      coverHidden ? {} : coverLogExtra(resolveCoverPost(post), coverSettings),
    [coverHidden, coverSettings],
  );
};
