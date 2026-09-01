import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { SnapshotFrame } from './SnapshotFrame';
import { truncateAtWord } from './snapshotText';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

/** Past five the type has to shrink below what survives a thumbnail. */
export const HIGHLIGHTS_SNAPSHOT_LIMIT = 5;

const HEADLINE_LIMIT = 90;

export interface HighlightsPageSnapshotCardProps {
  headlines: string[];
  /** Rendered under the divider, e.g. "Updated 4 minutes ago". */
  meta?: string;
  channel?: string;
  seed?: string;
}

function HighlightsPageSnapshotCardComponent(
  { headlines, meta, channel, seed }: HighlightsPageSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const shown = headlines.slice(0, HIGHLIGHTS_SNAPSHOT_LIMIT);
  const footer = [channel, meta].filter(Boolean).join(' · ');

  return (
    <SnapshotFrame ref={ref} seed={seed ?? shown.join('-')}>
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

        <ol className="mt-8 flex flex-1 flex-col justify-center gap-6">
          {shown.map((headline, index) => (
            <li key={headline} className="flex items-start gap-5">
              <span
                className="font-bold"
                style={{
                  color: colors.cabbage['10'],
                  fontSize: 30,
                  lineHeight: 1.25,
                }}
              >
                {index + 1}
              </span>
              <span
                className="snapshot-copy flex-1 font-bold text-white"
                style={{ fontSize: 34, lineHeight: 1.25 }}
              >
                {truncateAtWord(headline, HEADLINE_LIMIT)}
              </span>
            </li>
          ))}
        </ol>

        {footer && (
          <span
            className="mt-8 truncate"
            style={{
              color: MUTED,
              fontSize: 26,
              paddingTop: 26,
              borderTop: `1px solid ${DIVIDER}`,
            }}
          >
            {footer}
          </span>
        )}
      </div>
    </SnapshotFrame>
  );
}

export const HighlightsPageSnapshotCard = forwardRef(
  HighlightsPageSnapshotCardComponent,
);
