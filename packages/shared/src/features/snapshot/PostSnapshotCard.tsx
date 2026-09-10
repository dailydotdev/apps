import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { HighlightTextSnapshotCard } from './HighlightTextSnapshotCard';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { snapshotSource } from './snapshotSource';

interface PostSnapshotCardProps {
  post: Post;
  /** A surface label on the logo row, e.g. "Happening now". */
  eyebrow?: string;
  /** Paints the eyebrow with the surface's own wordmark gradient. */
  eyebrowGradient?: string;
  /**
   * Credits someone other than the post's source: the author, on surfaces
   * where a person wrote the copy rather than a publication.
   */
  credit?: { name: string; image?: string };
  seed?: string;
}

/**
 * The TLDR in white, credited to its source, with the surface's own label on
 * the logo row where it has one. The post headline is left off because
 * the TLDR already says what it says, at more length; so is the rest of the
 * page's furniture (date, thumbnail, follow, tags, counts, read time), which
 * competed with the copy for the room and cannot be pressed anyway.
 */
function PostSnapshotCardComponent(
  { post, eyebrow, eyebrowGradient, credit, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <HighlightTextSnapshotCard
      label={
        eyebrow && (
          <SnapshotEyebrow gradient={eyebrowGradient} label={eyebrow} />
        )
      }
      passage={post.summary ?? ''}
      ref={ref}
      seed={seed ?? post.id}
      source={credit ?? snapshotSource(post)}
    />
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
