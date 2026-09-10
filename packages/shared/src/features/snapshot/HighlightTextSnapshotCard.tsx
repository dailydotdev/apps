import type { ReactElement, ReactNode } from 'react';
import React, { forwardRef } from 'react';
import { SnapshotCredit } from './SnapshotCredit';
import { SnapshotFrame } from './SnapshotFrame';
import type { HighlightRange } from './snapshotText';
import {
  SNAPSHOT_COPY_SIZE,
  SNAPSHOT_PASSAGE_LIMIT,
  truncateAtWord,
  windowAroundHighlight,
} from './snapshotText';

export interface HighlightTextSnapshotCardProps {
  /** The paragraph the selection was taken from, quoted whole. */
  passage: string;
  /**
   * The marked run, as offsets into `passage` — the shape a DOM selection
   * already has. A range that is missing or does not land inside the passage
   * leaves the paragraph unmarked rather than guessing at one.
   */
  highlight?: HighlightRange;
  source?: { name: string; image?: string };
  /** The surface's own label, on the logo row. */
  label?: ReactNode;
  seed?: string;
}

/** The unmarked paragraph recedes far enough to read as context, not copy. */
const CONTEXT = 'rgba(255, 255, 255, 0.42)';
/** A marker tint, kept low enough that the bold copy stays the loud part. */
const MARK_BACKGROUND = 'rgba(217, 126, 254, 0.22)';

/**
 * The reader's selection shown where it came from: the whole paragraph, set
 * like the post card's TLDR, with the marked run picked out inside it. The
 * selection alone loses whatever made it worth marking — the sentence it
 * answers, the claim it qualifies — so the card carries the paragraph and
 * lets the highlight say which part was chosen.
 *
 * Without a highlight the passage is the whole subject — a TLDR, a paragraph
 * shared on its own — so it is set in full white with nothing marked; there is
 * no chosen part for the rest to recede behind.
 *
 * The source is named, not linked: a URL is unreadable at a glance and
 * unclickable in an image.
 */
function HighlightTextSnapshotCardComponent(
  { passage, highlight, source, label, seed }: HighlightTextSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const trimmed = passage.trim();
  const isValid =
    !!highlight &&
    highlight.start >= 0 &&
    highlight.end > highlight.start &&
    highlight.end <= trimmed.length;
  const windowed = isValid
    ? windowAroundHighlight(trimmed, highlight)
    : undefined;

  return (
    <SnapshotFrame grow wide logoAside={label} ref={ref} seed={seed ?? trimmed}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center">
          <p
            className={windowed ? undefined : 'text-white'}
            style={{
              color: windowed ? CONTEXT : undefined,
              fontSize: SNAPSHOT_COPY_SIZE,
              lineHeight: 1.55,
              overflowWrap: 'break-word',
            }}
          >
            {!windowed && truncateAtWord(trimmed, SNAPSHOT_PASSAGE_LIMIT)}
            {windowed && (
              <>
                {windowed.text.slice(0, windowed.highlight.start)}
                <span
                  className="font-bold text-white"
                  style={{
                    background: MARK_BACKGROUND,
                    borderRadius: 8,
                    // Each line of a wrapped selection keeps the padding and
                    // the corners, instead of the run being boxed as one
                    // shape.
                    boxDecorationBreak: 'clone',
                    WebkitBoxDecorationBreak: 'clone',
                    padding: '0.08em 0.14em',
                  }}
                >
                  {windowed.text.slice(
                    windowed.highlight.start,
                    windowed.highlight.end,
                  )}
                </span>
                {windowed.text.slice(windowed.highlight.end)}
              </>
            )}
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
