import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotFrame } from './SnapshotFrame';
import {
  SNAPSHOT_COPY_SIZE,
  SNAPSHOT_PASSAGE_LIMIT,
  truncateAtWord,
} from './snapshotText';

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
  const quote = truncateAtWord(comment, SNAPSHOT_PASSAGE_LIMIT);

  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? author.handle}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center">
          <p
            className="text-white"
            style={{
              fontSize: SNAPSHOT_COPY_SIZE,
              lineHeight: 1.55,
              overflowWrap: 'break-word',
            }}
          >
            {quote}
          </p>
        </div>

        <SnapshotCredit image={author.image} name={author.name} />
      </div>
    </SnapshotFrame>
  );
}

export const DiscussionSnapshotCard = forwardRef(
  DiscussionSnapshotCardComponent,
);
