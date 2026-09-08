import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotEyebrow } from './SnapshotEyebrow';
import { SnapshotFrame } from './SnapshotFrame';
import { HIGHLIGHTS_EYEBROW_GRADIENT } from './snapshotGradient';
import {
  SNAPSHOT_COPY_SIZE,
  SNAPSHOT_PASSAGE_LIMIT,
  truncateAtWord,
} from './snapshotText';

export interface HighlightSnapshotCardProps {
  /** The TLDR, and the whole subject of the card. */
  tldr: string;
  /** Credits the publication the claim came from, where the feed knows it. */
  source?: { name: string; image?: string };
  seed?: string;
}

/**
 * The claim in white under the Happening Now wordmark, credited to its source.
 * The headline is left off: the TLDR already says what it says, at more
 * length, and two statements of the same fact compete for the same glance.
 */
function HighlightSnapshotCardComponent(
  { tldr, source, seed }: HighlightSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const copy = truncateAtWord(tldr, SNAPSHOT_PASSAGE_LIMIT);

  return (
    <SnapshotFrame
      grow
      logoAside={
        <SnapshotEyebrow
          gradient={HIGHLIGHTS_EYEBROW_GRADIENT}
          label="Happening now"
        />
      }
      ref={ref}
      seed={seed ?? tldr}
      wide
    >
      <div className="flex flex-1 flex-col">
        {/* Body copy, not display copy: no balanced wrapping and no negative
            tracking, both of which fight legibility at normal weight, and the
            leading a long paragraph needs. */}
        <div className="flex flex-1 flex-col justify-center">
          <p
            className="text-white"
            style={{
              fontSize: SNAPSHOT_COPY_SIZE,
              lineHeight: 1.55,
              overflowWrap: 'break-word',
            }}
          >
            {copy}
          </p>
        </div>

        {source?.name && (
          <SnapshotCredit image={source.image} name={source.name} />
        )}
      </div>
    </SnapshotFrame>
  );
}

export const HighlightSnapshotCard = forwardRef(HighlightSnapshotCardComponent);
