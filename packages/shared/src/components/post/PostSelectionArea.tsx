import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { SelectionSharePost } from './SelectionShareProvider';
import { useSelectionShareArea } from './SelectionShareProvider';

export interface PostSelectionAreaProps {
  post: SelectionSharePost;
  /** Title, TL;DR and body — the parts of a post worth quoting. */
  children: ReactNode;
  /** False where the surface renders no comment composer. */
  canQuote?: boolean;
}

/**
 * Marks a post's readable content as quotable.
 *
 * Every post surface wraps the same shell around its body — navigation, source
 * strip, tags, metadata, and (via `BasePostContent`) the whole comment section.
 * Binding the bar to the surface's outer container therefore also armed it over
 * comments, so quoting a reply would attribute it to the post. This marks only
 * the content itself.
 *
 * The wrapper is `display: contents`, so it adds a node to the DOM tree — which
 * is all `Node.contains` needs — without adding a box to the layout. Dropping it
 * around existing markup cannot disturb flex or grid children.
 */
export function PostSelectionArea({
  post,
  children,
  canQuote = true,
}: PostSelectionAreaProps): ReactElement {
  const ref = useSelectionShareArea({ post, canQuote });

  return (
    <div className="contents" data-selection-area ref={ref}>
      {children}
    </div>
  );
}
