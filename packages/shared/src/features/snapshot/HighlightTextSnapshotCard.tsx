import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { snapshotCopyFontSize, windowPassage } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/**
 * The reader's own selection, set apart the way the page sets it apart. Kept
 * lighter than a solid fill: the marked run has to read as part of the passage,
 * not as a separate block.
 */
const MARK_BACKGROUND = 'rgba(177, 75, 215, 0.32)';
const MARK_EDGE = 'rgba(214, 196, 255, 0.42)';

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
  domain?: string;
  seed?: string;
}

/**
 * Set like the post card: same copy scale, same credit line. The two sit side
 * by side wherever this feature is reviewed, and a highlight is a post's text
 * — it should not look like a different product.
 */
function HighlightTextSnapshotCardComponent(
  { text, highlight, source, domain, seed }: HighlightTextSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const { before, marked, after } = windowPassage(text, highlight);
  const hasContext = !!(before || after);
  const credit = [source?.name, domain].filter(Boolean).join(' · ');

  return (
    <SnapshotFrame grow wide ref={ref} seed={seed ?? text}>
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
            style={{
              // Context sits back so the marked run carries the image.
              color: hasContext ? MUTED : '#FFFFFF',
              fontSize: snapshotCopyFontSize(
                before.length + marked.length + after.length,
              ),
              lineHeight: 1.55,
              overflowWrap: 'break-word',
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

        {credit && (
          <div
            className="flex items-center gap-4"
            style={{
              marginTop: 44,
              paddingTop: 32,
              borderTop: `1px solid ${DIVIDER}`,
            }}
          >
            {source?.image && (
              <img
                src={source.image}
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
    </SnapshotFrame>
  );
}

export const HighlightTextSnapshotCard = forwardRef(
  HighlightTextSnapshotCardComponent,
);
