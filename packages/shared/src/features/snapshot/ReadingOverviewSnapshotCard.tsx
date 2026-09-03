import type { ReactElement } from 'react';
import React, { forwardRef } from 'react';
import colors from '../../styles/colors';
import { largeNumberFormat } from '../../lib';
import { SnapshotFrame } from './SnapshotFrame';
import type { SnapshotIdentityProps } from './SnapshotIdentity';
import { SnapshotIdentity } from './SnapshotIdentity';

const MUTED = colors.salt['90'];
const DIVIDER = colors.pepper['10'];

const HEATMAP_ROWS = 4;
const HEATMAP_COLS = 22;
const HEATMAP_CELL = 20;
const HEATMAP_GAP = 6;

/** Four steps, matching the Less -> More legend on the profile heatmap. */
const HEATMAP_LEVELS = [
  colors.pepper['70'],
  colors.pepper['40'],
  colors.pepper['10'],
  '#FFFFFF',
];

export interface ReadingOverviewTag {
  name: string;
  percentage: number;
}

export interface ReadingOverviewSnapshotCardProps {
  user: Omit<SnapshotIdentityProps, 'label'>;
  longestStreak: number;
  totalReadingDays: number;
  postsRead: number;
  monthsLabel: string;
  topTags: ReadingOverviewTag[];
  /** One entry per cell, 0-3, read left to right like the profile heatmap. */
  heatmap: number[];
  seed?: string;
}

const Tile = ({
  value,
  label,
  glyph,
}: {
  value: string;
  label: string;
  glyph?: string;
}): ReactElement => (
  <div
    className="flex flex-1 flex-col items-center justify-center gap-1 rounded-24"
    style={{
      padding: '22px 16px',
      border: `1px solid ${DIVIDER}`,
      background: 'rgba(255, 255, 255, 0.03)',
    }}
  >
    <span
      className="font-bold text-white"
      style={{ fontSize: 56, lineHeight: 1 }}
    >
      {value}
    </span>
    <span style={{ color: MUTED, fontSize: 24, lineHeight: 1.3 }}>
      {label} {glyph}
    </span>
  </div>
);

const TagChip = ({
  name,
  percentage,
  share,
}: ReadingOverviewTag & { share: number }): ReactElement => {
  // Relative to the strongest tag, so the leader reads as a full-ish bar and
  // the rest fall away from it — an absolute percentage would fill them all.
  const fill = Math.max(12, Math.min(share * 68, 68));

  return (
    <div
      className="flex items-center justify-between overflow-hidden rounded-12"
      style={{
        padding: '10px 16px',
        border: `1px solid ${DIVIDER}`,
        background: `linear-gradient(90deg, ${colors.cabbage['50']} 0%, ${colors.cabbage['50']} ${fill}%, rgba(255,255,255,0.03) ${fill}%)`,
      }}
    >
      <span
        className="truncate font-bold text-white"
        style={{ fontSize: 24, maxWidth: 190 }}
      >
        {name}
      </span>
      <span className="font-bold" style={{ color: MUTED, fontSize: 24 }}>
        +{percentage}%
      </span>
    </div>
  );
};

function ReadingOverviewSnapshotCardComponent(
  {
    user,
    longestStreak,
    totalReadingDays,
    postsRead,
    monthsLabel,
    topTags,
    heatmap,
    seed,
  }: ReadingOverviewSnapshotCardProps,
  ref: React.Ref<HTMLDivElement>,
): ReactElement {
  const cells = heatmap.slice(0, HEATMAP_ROWS * HEATMAP_COLS);
  const visibleTags = topTags.slice(0, 6);
  const topPercentage = Math.max(
    ...visibleTags.map((tag) => tag.percentage),
    1,
  );

  return (
    <SnapshotFrame ref={ref} seed={seed ?? 'reading-overview'}>
      <div className="flex flex-1 flex-col gap-6">
        <SnapshotIdentity {...user} label="Reading overview" />

        <div className="flex gap-4">
          <Tile
            glyph="🏆"
            label="Longest streak"
            value={String(longestStreak)}
          />
          <Tile
            label="Total reading days"
            value={
              largeNumberFormat(totalReadingDays) ?? String(totalReadingDays)
            }
          />
        </div>

        <div className="flex flex-col gap-3">
          <span style={{ color: MUTED, fontSize: 26 }}>
            Top tags by reading days
          </span>
          <div className="grid grid-cols-2 gap-3">
            {visibleTags.map((tag) => (
              <TagChip
                key={tag.name}
                {...tag}
                share={tag.percentage / topPercentage}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <span style={{ color: MUTED, fontSize: 26 }}>
            Posts read {monthsLabel} (
            {largeNumberFormat(postsRead) ?? postsRead})
          </span>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${HEATMAP_COLS}, ${HEATMAP_CELL}px)`,
              gap: HEATMAP_GAP,
            }}
          >
            {cells.map((level, index) => (
              <span
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={{
                  width: HEATMAP_CELL,
                  height: HEATMAP_CELL,
                  borderRadius: '50%',
                  background: HEATMAP_LEVELS[Math.min(level, 3)],
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </SnapshotFrame>
  );
}

export const ReadingOverviewSnapshotCard = forwardRef(
  ReadingOverviewSnapshotCardComponent,
);
