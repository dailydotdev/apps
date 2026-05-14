import type { ReactElement } from 'react';
import React from 'react';
import type { Post } from '../../graphql/posts';
import { useBlockPostPanel } from './useBlockPostPanel';
import { PostHiddenPanel } from '../../components/post/block/PostHiddenPanel';

/**
 * Returns the inline hide-feedback panel element when the cached block
 * panel data for `post` is in `hide` mode, otherwise null. Card variants
 * call this once and early-return the result so the card body is replaced
 * in place with the panel.
 */
export const useHiddenFeedbackPanel = (post: Post): ReactElement | null => {
  const { data } = useBlockPostPanel(post);

  if (!data?.showTagsPanel || data?.mode !== 'hide') {
    return null;
  }

  return <PostHiddenPanel className="h-full overflow-hidden" post={post} />;
};
