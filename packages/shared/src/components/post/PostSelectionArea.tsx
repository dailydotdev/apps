import type { ReactElement, ReactNode } from 'react';
import React, { useRef } from 'react';
import type { Post } from '../../graphql/posts';
import { SelectionShareBar } from './SelectionShareBar';

export interface PostSelectionAreaProps {
  post: Post;
  /** Title, TL;DR and body — the parts of a post worth quoting. */
  children: ReactNode;
}

/**
 * Scopes the selection share bar to a post's readable content.
 *
 * Every post surface wraps the same shell around its body — navigation, source
 * strip, tags, metadata, and (via `BasePostContent`) the whole comment section.
 * Binding the bar to the surface's outer container therefore also armed it over
 * comments, so quoting a reply would attribute it to the post. This wraps only
 * the content itself.
 *
 * The wrapper is `display: contents`, so it adds a node to the DOM tree — which
 * is all `Node.contains` needs — without adding a box to the layout. Dropping it
 * around existing markup cannot disturb flex or grid children.
 */
export function PostSelectionArea({
  post,
  children,
}: PostSelectionAreaProps): ReactElement {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="contents" ref={contentRef}>
        {children}
      </div>
      <SelectionShareBar containerRef={contentRef} post={post} />
    </>
  );
}
