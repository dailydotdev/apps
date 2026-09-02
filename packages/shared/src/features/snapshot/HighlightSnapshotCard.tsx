import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { truncateAtWord } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

const TLDR_LIMIT = 220;

/** Longer headlines step down rather than push the TLDR off the edge. */
const headlineFontSize = (length: number): number => {
  if (length <= 50) {
    return 64;
  }

  if (length <= 90) {
    return 54;
  }

  if (length <= 140) {
    return 44;
  }

  return 38;
};

export interface HighlightSnapshotCardProps {
  headline: string;
  tldr?: string;
  /** The same relative time the row shows, e.g. "2h ago". */
  meta?: string;
  seed?: string;
}

function HighlightSnapshotCardComponent(
  { headline, tldr, meta, seed }: HighlightSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const summary = tldr ? truncateAtWord(tldr, TLDR_LIMIT) : '';

  return (
    <SnapshotFrame ref={ref} seed={seed ?? headline}>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: colors.ketchup['40'],
            }}
          />
          <span
            className="font-bold uppercase"
            style={{
              color: colors.ketchup['40'],
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            Happening now
          </span>
        </div>

        <h1
          className="snapshot-copy mt-7 font-bold text-white"
          style={{
            fontSize: headlineFontSize(headline.length),
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {headline}
        </h1>

        {summary && (
          <p
            className="snapshot-copy mt-7 flex-1"
            style={{ color: MUTED, fontSize: 30, lineHeight: 1.4 }}
          >
            {summary}
          </p>
        )}

        {meta && (
          <span
            className="mt-9 truncate"
            style={{
              color: MUTED,
              fontSize: 26,
              paddingTop: 26,
              borderTop: `1px solid ${DIVIDER}`,
            }}
          >
            {meta}
          </span>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const HighlightSnapshotCard = forwardRef(HighlightSnapshotCardComponent);
