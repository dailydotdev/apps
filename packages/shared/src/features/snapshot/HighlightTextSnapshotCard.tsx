import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotFrame } from './SnapshotFrame';
import {
  SNAPSHOT_COPY_SIZE,
  SNAPSHOT_PASSAGE_LIMIT,
  truncateAtWord,
} from './snapshotText';

export interface HighlightTextSnapshotCardProps {
  /** What the reader marked, and the whole subject of the card. */
  text: string;
  source?: { name: string; image?: string };
  seed?: string;
}

/**
 * The reader's selection, set like the post card's TLDR: same copy scale,
 * same credit. Nothing around the selection is carried — what was marked is
 * what gets sent, so the card needs no highlight of its own. The source is
 * named, not linked: a URL is unreadable at a glance and unclickable in an
 * image.
 */
function HighlightTextSnapshotCardComponent(
  { text, source, seed }: HighlightTextSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const quote = truncateAtWord(text, SNAPSHOT_PASSAGE_LIMIT);

  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? text}>
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

        {source?.name && (
          <SnapshotCredit image={source.image} name={source.name} />
        )}
      </div>
    </SnapshotFrame>
  );
}

export const HighlightTextSnapshotCard = forwardRef(
  HighlightTextSnapshotCardComponent,
);
