import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { SponsoredStripProps } from './SponsoredStrip';
import { SponsorRailPinned } from './SponsoredStrip';

// =============================================================
// The dock — the sponsor row with a value rail stacked beneath.
//
// This is the answer to the link-status bubble, and it is worth
// stating plainly because the fix does not look like a fix. The
// browser paints its URL preview over the bottom corners of the
// viewport, and a feed is nearly all links, so anything flush to
// the bottom edge is covered most of the time. Floating the bar
// clear of the edge works and reads badly: it detaches from the
// product.
//
// Stacking solves it without moving anything. The rail underneath
// takes the hit, and it is the right thing to sacrifice — ambient
// data that loses nothing by being briefly half-covered, unlike
// the row someone paid for. Each rail also opens with its label
// on the left, which is where the bubble lands first, so what it
// covers is the least worth reading on the row.
//
// It also earns the space. A permanent bar that only carries
// advertising is rent; one that carries something the reader came
// for is a feature that happens to be sponsored — which is what
// the broadcast format it borrows from has always been.
// =============================================================

export type SponsorDockProps = SponsoredStripProps & {
  /** The rail stacked beneath the sponsor row. */
  children?: ReactNode;
};

export const SponsorDock = ({
  children,
  className,
  ...strip
}: SponsorDockProps): ReactElement => (
  <div
    className={classNames(
      'sticky bottom-0 z-3 flex w-full flex-col bg-background-default',
      className,
    )}
  >
    {/* The row keeps its own chrome but gives up its stickiness:
        the dock is what pins now, so the two rows move together. */}
    <SponsorRailPinned {...strip} className="!static" />
    {children}
  </div>
);
