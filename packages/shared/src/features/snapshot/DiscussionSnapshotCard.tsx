import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';

export interface DiscussionSnapshotCardProps {
  comment: string;
  author: { name: string; handle: string; image?: string };
  seed?: string;
}

/**
 * A comment, set like the post card's TLDR and credited to whoever wrote it.
 * No label above the copy: a comment in someone's name already reads as a
 * comment, and the post it hung off was context nobody shares for.
 */
function DiscussionSnapshotCardComponent(
  { comment, author, seed }: DiscussionSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <HighlightTextSnapshotCard
      passage={comment}
      ref={ref}
      seed={seed ?? author.handle}
      source={{ name: author.name, image: author.image }}
    />
  );
}

export const DiscussionSnapshotCard = forwardRef(
  DiscussionSnapshotCardComponent,
);
