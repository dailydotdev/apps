import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { SnapshotFrame } from './SnapshotFrame';

/**
 * The TLDR is the payload, so it takes as much size as it can carry: a short
 * one gets set large, a long one steps down rather than clip.
 */
const summaryFontSize = (length: number): number => {
  if (length <= 140) {
    return 54;
  }

  if (length <= 280) {
    return 46;
  }

  if (length <= 480) {
    return 38;
  }

  return 33;
};

interface PostSnapshotCardProps {
  post: Post;
  seed?: string;
}

/**
 * The TLDR, in white, and nothing else. Everything the page puts around it —
 * headline, source, date, thumbnail, follow, tags, counts, read time — is off
 * the card: it competed with the copy for the room, and none of it can be
 * pressed in a still image. The frame's own mark is the only attribution.
 */
function PostSnapshotCardComponent(
  { post, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const summary = post.summary?.trim();

  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? post.id}>
      <div className="flex flex-1 flex-col justify-center">
        {/* Body copy, not display copy: no balanced wrapping and no negative
            tracking, both of which fight legibility at normal weight, and the
            leading a long paragraph needs. */}
        {summary && (
          <p
            className="text-white"
            style={{
              fontSize: summaryFontSize(summary.length),
              lineHeight: 1.55,
              overflowWrap: 'break-word',
            }}
          >
            {summary}
          </p>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
