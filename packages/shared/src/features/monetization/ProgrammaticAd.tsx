import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';

/** Names the page/context a unit serves on, for per-surface placements. */
export type ProgrammaticAdSurface = string;

export enum ProgrammaticAdFormat {
  Leaderboard = 'leaderboard',
  MediumRectangle = 'mediumRectangle',
  Rectangle = 'rectangle',
  HalfPage = 'halfPage',
  MobileBanner = 'mobileBanner',
}

type FormatSpec = {
  label: string;
  /** The sizes the unit is configured for on the partner side. */
  size: string;
};

/**
 * What each format stands for. Descriptive only: the sizes a unit may
 * actually render at live in the ad partner's configuration for its anchor,
 * so this is what the development placeholder and the design review show.
 */
export const FORMAT_SPEC: Record<ProgrammaticAdFormat, FormatSpec> = {
  // Leaderboard on desktop; the phone header is the MobileBanner twin below.
  [ProgrammaticAdFormat.Leaderboard]: {
    label: 'Leaderboard',
    size: '728x90 · 320x100 mobile',
  },
  [ProgrammaticAdFormat.MediumRectangle]: {
    label: 'Medium rectangle',
    size: '300x250',
  },
  [ProgrammaticAdFormat.Rectangle]: {
    label: 'In-content',
    size: '336x280 · 300x250 mobile',
  },
  [ProgrammaticAdFormat.HalfPage]: {
    label: 'Sticky rail',
    size: '300x600',
  },
  // The phone header unit at the fixed 320x50: the smallest standard size,
  // so the pinned header block takes the least of a phone screen.
  [ProgrammaticAdFormat.MobileBanner]: {
    label: 'Mobile banner',
    size: '320x50',
  },
};

/** The attribute an ad partner's placement selectors key on. */
export const AD_SLOT_ATTRIBUTE = 'data-ad-slot';

/**
 * The anchor's id, stable across deploys: it is what the unit configs in
 * the ad partner's platform target, so renaming one silently unplaces a unit.
 */
export const getAdSlotId = (
  surface: ProgrammaticAdSurface,
  slot: number,
): string => `${surface}-${slot}`;

export interface ProgrammaticAdProps {
  slot: number;
  format: ProgrammaticAdFormat;
  surface: ProgrammaticAdSurface;
  className?: string;
  /** Drops the anchor below the tablet breakpoint, and the unit with it. */
  hideOnPhone?: boolean;
}

/**
 * One programmatic slot: an empty anchor an ad partner's tag fills. The
 * tag places units by CSS selector from its own configuration, so the anchor
 * carries a stable id and nothing else. It takes no room until a unit lands
 * in it, so a slot the tag leaves empty never leaves a gap in the page, most
 * visibly in the comment thread. Callers own the audience/flag gating.
 */
export function ProgrammaticAd({
  slot,
  format,
  surface,
  className,
  hideOnPhone,
}: ProgrammaticAdProps): ReactElement {
  return (
    <div
      data-ad-slot={getAdSlotId(surface, slot)}
      data-ad-format={format}
      data-testid={`ad-slot-${slot}`}
      className={classNames(
        // Important because the breakpoint variant below sits in a media
        // query, which the generated stylesheet emits after this plain rule.
        'mx-auto w-full justify-center empty:!hidden',
        hideOnPhone ? 'hidden tablet:flex' : 'flex',
        className,
      )}
    />
  );
}
