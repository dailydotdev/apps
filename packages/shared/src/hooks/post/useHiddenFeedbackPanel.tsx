import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { useBlockPostPanel } from './useBlockPostPanel';
import { PostHiddenPanel } from '../../components/post/block/PostHiddenPanel';

interface UseHiddenFeedbackPanel {
  isHidden: boolean;
  content: ReactElement | null;
}

/**
 * Returns a flag plus the inline hide-feedback panel content when the cached
 * block panel state for `post` is in `hide` mode. Card variants check
 * `isHidden` and render `content` inside their own `FeedItemContainer` so the
 * outer card footprint (sizing, raised label, hover, bookmark border) stays
 * identical to the regular post card and there is no layout shift.
 */
export const useHiddenFeedbackPanel = (post: Post): UseHiddenFeedbackPanel => {
  const { data } = useBlockPostPanel(post);
  const isHidden = !!(data?.showTagsPanel && data?.mode === 'hide');

  return {
    isHidden,
    content: isHidden ? <PostHiddenPanel post={post} /> : null,
  };
};
