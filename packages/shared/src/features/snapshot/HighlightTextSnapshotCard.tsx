import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { windowPassage } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/**
 * The reader's own selection, set apart the way the page sets it apart. Kept
 * lighter than a solid fill: the marked run has to read as part of the passage,
 * not as a separate block.
 */
const MARK_BACKGROUND = 'rgba(177, 75, 215, 0.32)';
const MARK_EDGE = 'rgba(214, 196, 255, 0.42)';

/**
 * The passage is the whole image, so it takes as much size as it can carry:
 * short ones get set large, longer ones step down rather than clip.
 */
const passageFontSize = (length: number): number => {
  if (length <= 70) {
    return 72;
  }

  if (length <= 140) {
    return 60;
  }

  if (length <= 240) {
    return 48;
  }

  if (length <= 480) {
    return 40;
  }

  return 34;
};

export interface HighlightTextSnapshotCardProps {
  /**
   * The passage around the selection — a paragraph, or the whole body. Sharing
   * only what was marked loses the point the reader was making, so the image
   * carries the context and marks the selection inside it.
   */
  text: string;
  /** The marked run, as it appears in `text`. Without it the passage stands alone. */
  highlight?: string;
  source?: { name: string; image?: string };
  postTitle?: string;
  domain?: string;
  seed?: string;
}

function HighlightTextSnapshotCardComponent(
  {
    text,
    highlight,
    source,
    postTitle,
    domain,
    seed,
  }: HighlightTextSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const { before, marked, after } = windowPassage(text, highlight);
  const attribution = [postTitle, domain].filter(Boolean).join(' · ');
  const hasContext = !!(before || after);

  return (
    <SnapshotFrame grow ref={ref} seed={seed ?? text}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center">
          {/* An opening quote over a windowed passage would claim the context
              as the quote too, so it only leads a bare selection. */}
          {!hasContext && (
            <span
              aria-hidden
              className="font-bold"
              style={{
                color: colors.cabbage['10'],
                fontSize: 96,
                lineHeight: 0.6,
                height: 58,
              }}
            >
              &ldquo;
            </span>
          )}
          <p
            className="snapshot-copy font-bold"
            style={{
              // Context sits back so the marked run carries the image.
              color: hasContext ? MUTED : '#FFFFFF',
              fontSize: passageFontSize(
                before.length + marked.length + after.length,
              ),
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            {before}
            <span
              className="text-white"
              style={{
                background: MARK_BACKGROUND,
                boxShadow: `inset 0 0 0 1px ${MARK_EDGE}`,
                borderRadius: 8,
                padding: '0.08em 0.12em',
                // Each wrapped line gets its own box, so a multi-line mark
                // reads as marked text rather than one tall block.
                boxDecorationBreak: 'clone',
                WebkitBoxDecorationBreak: 'clone',
              }}
            >
              {marked}
            </span>
            {after}
          </p>
        </div>

        <div
          className="flex flex-col gap-4"
          style={{ paddingTop: 26, borderTop: `1px solid ${DIVIDER}` }}
        >
          {source && (
            <div className="flex items-center gap-4">
              {source.image && (
                <img
                  src={source.image}
                  alt=""
                  crossOrigin="anonymous"
                  className="block size-14 rounded-12 object-cover"
                />
              )}
              <span
                className="font-bold text-white"
                style={{ fontSize: 30, lineHeight: 1.2 }}
              >
                {source.name}
              </span>
            </div>
          )}
          {attribution && (
            <span style={{ color: MUTED, fontSize: 26, lineHeight: 1.3 }}>
              {attribution}
            </span>
          )}
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const HighlightTextSnapshotCard = forwardRef(
  HighlightTextSnapshotCardComponent,
);
