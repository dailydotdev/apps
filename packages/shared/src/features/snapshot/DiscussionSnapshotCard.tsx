import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { SnapshotIdentity } from './SnapshotIdentity';
import { truncateAtWord } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

export interface DiscussionSnapshotCardProps {
  postTitle: string;
  comment: string;
  author: { name: string; handle: string; image?: string };
  upvotes: number;
  replies: number;
  seed?: string;
}

function DiscussionSnapshotCardComponent(
  {
    postTitle,
    comment,
    author,
    upvotes,
    replies,
    seed,
  }: DiscussionSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  return (
    <SnapshotFrame ref={ref} seed={seed ?? postTitle}>
      <div className="flex flex-1 flex-col">
        <span
          className="font-bold uppercase"
          style={{
            color: colors.cabbage['10'],
            fontSize: 22,
            letterSpacing: 2,
          }}
        >
          From the discussion
        </span>

        <div className="mt-6 flex flex-1 flex-col justify-center">
          <p
            className="snapshot-copy font-bold text-white"
            style={{
              fontSize: 46,
              lineHeight: 1.25,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 7,
              overflow: 'hidden',
            }}
          >
            {truncateAtWord(comment)}
          </p>
        </div>

        {/* Muted and small: the comment is the subject, the post is context. */}
        <span
          className="mt-2"
          style={{
            color: MUTED,
            fontSize: 30,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {postTitle}
        </span>

        <div
          className="mt-7 flex flex-col gap-4"
          style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
        >
          <SnapshotIdentity {...author} />
          <span style={{ color: MUTED, fontSize: 26 }}>
            {upvotes} upvotes · {replies} replies
          </span>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const DiscussionSnapshotCard = forwardRef(
  DiscussionSnapshotCardComponent,
);
