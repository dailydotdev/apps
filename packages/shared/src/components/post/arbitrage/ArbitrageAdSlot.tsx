import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

export enum ArbitrageAdFormat {
  Leaderboard = 'leaderboard',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  SidebarRail = 'sidebarRail',
  Native = 'native',
  Video = 'video',
  RichMedia = 'richMedia',
  Anchor = 'anchor',
}

type FormatSpec = {
  label: string;
  size: string;
  cpm: string;
  minHeight: string;
};

const FORMAT_SPEC: Record<ArbitrageAdFormat, FormatSpec> = {
  [ArbitrageAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 / 320x100',
    cpm: '$2.50',
    minHeight: 'min-h-[90px]',
  },
  [ArbitrageAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280',
    cpm: '$3.00',
    minHeight: 'min-h-[180px]',
  },
  [ArbitrageAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
    cpm: '$4.00',
    minHeight: 'min-h-[320px]',
  },
  [ArbitrageAdFormat.SidebarRail]: {
    label: 'Sidebar',
    size: '240x400',
    cpm: '$4.00',
    minHeight: 'min-h-[220px]',
  },
  [ArbitrageAdFormat.Native]: {
    label: 'Native',
    size: 'fluid',
    cpm: '$3.00',
    minHeight: 'min-h-[96px]',
  },
  [ArbitrageAdFormat.Video]: {
    label: 'Outstream video',
    size: '16:9 muted',
    cpm: '$7.00',
    minHeight: 'min-h-[200px]',
  },
  [ArbitrageAdFormat.RichMedia]: {
    label: 'Rich media',
    size: 'responsive',
    cpm: '$4.00',
    minHeight: 'min-h-[160px]',
  },
  [ArbitrageAdFormat.Anchor]: {
    label: 'Anchor',
    size: '728x90 / 320x50',
    cpm: '$2.00',
    minHeight: 'min-h-[56px]',
  },
};

export interface ArbitrageAdSlotProps {
  slot: number;
  format: ArbitrageAdFormat;
  className?: string;
  /** Share of visitors expected to scroll far enough for this slot to bill. */
  reach?: string;
  /** Marks slots wired to a declared 30-60s in-view refresh once on Ad Manager. */
  refreshes?: boolean;
}

/**
 * Placeholder for a programmatic ad slot. No ad tag exists in the app yet, so
 * this renders the reserved box at the real creative height — the point is to
 * review density and layout before any demand is wired up. Reserving the height
 * here is also what a live slot must do to avoid layout shift.
 */
export function ArbitrageAdSlot({
  slot,
  format,
  className,
  reach,
  refreshes,
}: ArbitrageAdSlotProps): ReactElement {
  const spec = FORMAT_SPEC[format];

  return (
    <div
      className={classNames(
        'bg-accent-cheese-default/[0.06] relative flex w-full items-center justify-center rounded-12 border border-dashed border-accent-cheese-default px-3 py-4',
        spec.minHeight,
        className,
      )}
      data-testid={`arbitrage-ad-slot-${slot}`}
    >
      <span className="absolute -top-2 left-3 rounded-6 bg-accent-cheese-default px-2 py-0.5 font-bold text-surface-invert typo-caption2">
        {slot}
      </span>
      <span className="absolute -top-2 right-3 rounded-6 border border-accent-cheese-default bg-background-default px-2 py-0.5 text-accent-cheese-default typo-caption2">
        {spec.size} · {spec.cpm}
        {refreshes ? ' · refreshes' : ''}
      </span>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-bold text-text-tertiary typo-footnote">
          {spec.label}
        </span>
        {!!reach && (
          <span className="text-text-quaternary typo-caption1">
            seen by {reach} of visitors
          </span>
        )}
      </div>
      <span className="absolute bottom-1 right-2 text-text-quaternary typo-caption2">
        Ad
      </span>
    </div>
  );
}
