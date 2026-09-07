import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import colors from '../../styles/colors';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotFrame } from './SnapshotFrame';
import { SNAPSHOT_COPY_SIZE } from './snapshotText';

interface PostSnapshotCardProps {
  post: Post;
  /** A surface label above the copy, e.g. "Happening now". */
  eyebrow?: string;
  /** Paints the eyebrow with the surface's own wordmark gradient. */
  eyebrowGradient?: string;
  seed?: string;
}

/**
 * The TLDR in white, credited to its source, under the surface's own label
 * where it has one. The post headline is left off because
 * the TLDR already says what it says, at more length; so is the rest of the
 * page's furniture — date, thumbnail, follow, tags, counts, read time — which
 * competed with the copy for the room and cannot be pressed anyway.
 */
function PostSnapshotCardComponent(
  { post, eyebrow, eyebrowGradient, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const summary = post.summary?.trim();
  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? post.id}>
      <div className="flex flex-1 flex-col">
        {eyebrow && (
          <span
            className="font-bold uppercase"
            style={{
              marginBottom: 32,
              fontSize: 22,
              letterSpacing: 2,
              ...(eyebrowGradient
                ? {
                    color: 'transparent',
                    backgroundImage: eyebrowGradient,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                  }
                : { color: colors.cabbage['10'] }),
            }}
          >
            {eyebrow}
          </span>
        )}

        {/* Body copy, not display copy: no balanced wrapping and no negative
            tracking, both of which fight legibility at normal weight, and the
            leading a long paragraph needs. */}
        <div className="flex flex-1 flex-col justify-center">
          {summary && (
            <p
              className="text-white"
              style={{
                fontSize: SNAPSHOT_COPY_SIZE,
                lineHeight: 1.55,
                overflowWrap: 'break-word',
              }}
            >
              {summary}
            </p>
          )}
        </div>

        {post.source?.name && (
          <SnapshotCredit image={post.source.image} name={post.source.name} />
        )}
      </div>
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
