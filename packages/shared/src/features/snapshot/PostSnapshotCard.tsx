import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import type { Post } from '../../graphql/posts';
import { formatDate, TimeFormatType } from '../../lib/dateFormat';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';

const MUTED = colors.salt['90'];

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
 * The TLDR leads, in white, with the headline and then the credit under it.
 * The rest of the page is left off — thumbnail, follow, tags, counts, read
 * time: it competes with the copy for the room, and none of it can be pressed
 * in a still image.
 */
function PostSnapshotCardComponent(
  { post, seed }: PostSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const summary = post.summary?.trim();
  // One line, dot-separated: two stacked lines of grey read as two facts, and
  // the credit is one.
  const credit = [
    post.source?.name,
    post.createdAt &&
      formatDate({ value: post.createdAt, type: TimeFormatType.Post }),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? post.id}>
      <div className="flex flex-1 flex-col">
        {/* Body copy, not display copy: no balanced wrapping and no negative
            tracking, both of which fight legibility at normal weight, and the
            leading a long paragraph needs. */}
        <div className="flex flex-1 flex-col justify-center">
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

        <div className="flex flex-col gap-4" style={{ paddingTop: 40 }}>
          {post.title && (
            <span
              className="snapshot-copy font-bold text-white"
              style={{ fontSize: 32, lineHeight: 1.25 }}
            >
              {post.title}
            </span>
          )}

          {credit && (
            <div className="flex items-center gap-4">
              {post.source?.image && (
                <img
                  src={post.source.image}
                  alt=""
                  crossOrigin="anonymous"
                  className="block size-14 rounded-full object-cover"
                />
              )}
              <span style={{ color: MUTED, fontSize: 28, lineHeight: 1.2 }}>
                {credit}
              </span>
            </div>
          )}
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const PostSnapshotCard = forwardRef(PostSnapshotCardComponent);
