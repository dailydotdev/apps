import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { SnapshotFrame } from './SnapshotFrame';
import { SNAPSHOT_COPY_SIZE } from './snapshotText';

interface PostSnapshotCardProps {
  post: Post;
  /** A surface label above the copy, e.g. "Happening now". */
  eyebrow?: string;
  /** Paints the eyebrow with the surface's own wordmark gradient. */
  eyebrowGradient?: string;
  /**
   * Credits someone other than the post's source — the author, on surfaces
   * where a person wrote the copy rather than a publication.
   */
  credit?: { name: string; image?: string };
  seed?: string;
}

/**
 * The TLDR in white, credited to its source, with the surface's own label on
 * the logo row where it has one. The post headline is left off because
 * the TLDR already says what it says, at more length; so is the rest of the
 * page's furniture — date, thumbnail, follow, tags, counts, read time — which
 * competed with the copy for the room and cannot be pressed anyway.
 */
function PostSnapshotCardComponent(
  { post, eyebrow, eyebrowGradient, credit, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const summary = post.summary?.trim();
  const source = credit ?? post.source;
  const label = eyebrow && (
    <SnapshotEyebrow gradient={eyebrowGradient} label={eyebrow} />
  );

  return (
    <SnapshotFrame grow wide logoAside={label} ref={ref} seed={seed ?? post.id}>
      <div className="flex flex-1 flex-col">
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

        {source?.name && (
          <SnapshotCredit image={source.image} name={source.name} />
        )}
      </div>
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
