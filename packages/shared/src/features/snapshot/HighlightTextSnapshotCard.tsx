import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { truncateAtWord } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/**
 * The quote is the whole image, so it takes as much size as it can carry:
 * short highlights get set large, longer ones step down rather than clip.
 */
const quoteFontSize = (length: number): number => {
  if (length <= 70) {
    return 72;
  }

  if (length <= 140) {
    return 60;
  }

  if (length <= 240) {
    return 48;
  }

  return 40;
};

export interface HighlightTextSnapshotCardProps {
  text: string;
  source?: { name: string; image?: string };
  postTitle?: string;
  domain?: string;
  seed?: string;
}

function HighlightTextSnapshotCardComponent(
  { text, source, postTitle, domain, seed }: HighlightTextSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const quote = truncateAtWord(text);
  const attribution = [postTitle, domain].filter(Boolean).join(' · ');

  return (
    <SnapshotFrame ref={ref} seed={seed ?? text}>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center">
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
          <p
            className="snapshot-copy font-bold text-white"
            style={{
              fontSize: quoteFontSize(quote.length),
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
            }}
          >
            {quote}
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
